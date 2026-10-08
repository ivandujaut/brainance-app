# Lanzamiento de la beta: checklist

Única fuente de los pasos manuales para desplegar BrAInance (spec 008). Se sigue en orden; cada paso dice **dónde** se hace y **cómo verificarlo**. Las claves se pegan directamente en cada proveedor: nunca en el chat, en issues ni en commits.

> Estado: marcá cada casilla en el PR que cierre el lanzamiento.

## 0. Seguridad (antes que nada)

- [ ] **Rotar las credenciales que quedaron en el historial de git** (el `.env` original se commiteó en el repo heredado):
  - Clerk: *Dashboard → API Keys →* regenerar la secret key de la instancia vieja (o borrar esa instancia).
  - Uploadcare: *Dashboard → API keys →* crear un par nuevo y revocar el viejo.
    - 2026-10-06: la cuenta actual se abrió ese día y no tiene el proyecto viejo. Las claves publicadas son de **otra cuenta**: hay que entrar a esa y borrar el proyecto.
  - Base de datos vieja: cambiar la contraseña o borrar esa base.
  - *Verificar:* las claves viejas dejan de funcionar.
- [ ] **Tag del código heredado.** El tag `legado-corinna` existe en el entorno de desarrollo, pero el push no pasó por el proxy. Crearlo desde tu máquina: `git fetch origin && git tag legado-corinna a423390 && git push origin legado-corinna` (a423390 es `develop` antes de la limpieza). *Verificar:* aparece en *GitHub → Tags*.

## 1. Base de datos (Neon, ADR 0002)

- [x] Crear el proyecto `brainance` en Neon: AWS São Paulo (`aws-sa-east-1`), Postgres 16 (el mismo que CI), base `brainance`. Branches: `production` y `development` (para las previews, sin vencimiento).
- [x] Cada branch tiene dos cadenas de conexión (*Connect*): la **pooled**, con `-pooler` en el host (`DATABASE_URL` en Vercel), y la **directa** (`DIRECT_URL`, para migrar).
- [x] *GitHub → Settings → Secrets and variables → Actions:* cargar las cadenas **directas**:
  - `NEON_DIRECT_URL`: branch `production`.
  - `NEON_DEV_DIRECT_URL`: branch `development`.
- [x] Aplicar las migraciones: *Actions → Migrar base → Run workflow*, primero con `development` y después con `production`. Se repite con cada migración nueva (última: 2026-10-07, `owner_response_time` del QA de la spec 011). El workflow (`.github/workflows/migrate.yml`) rechaza una cadena con pooler y oculta el host en el log.
  - Alternativa desde tu máquina: `DIRECT_URL="<directa>" npx prisma migrate deploy`.
  - Si la base se creó antes con `db push`, primero: `npx prisma migrate resolve --applied 20261001000000_init`.
  - La migración `20261007120000_remove_legacy` se frena sola si `Bookings`, `Campaign` o `Product` tienen filas. En ese caso, exportalas y vaciá las tablas antes.
- [x] *Verificar:* el último paso del workflow ("Check the schema is up to date") dice "Database schema is up to date!".

## 2. Clerk (cuentas)

- [ ] Crear la **instancia de producción** y conectar el dominio de la app.
- [ ] *User & authentication → Social connections →* habilitar **Google**, con credenciales propias de Google Cloud en producción.
- [ ] *Paths:* sign-in `/auth/sign-in`, sign-up `/auth/sign-up`, redirección después del ingreso `/dashboard`.
- [ ] Anotar tu **user id** (*Users →* tu usuario →* `user_…`) para `ADMIN_CLERK_IDS`.
- [ ] *Verificar:* podés registrarte con email y con Google en la preview (paso 7).

## 3. GitHub (CI)

- [x] *Repo → Settings → Secrets and variables → Actions → New repository secret:*
  - `E2E_CLERK_PUBLISHABLE_KEY` y `E2E_CLERK_SECRET_KEY`, de la instancia de **desarrollo** de Clerk (no la de producción). Los tests crean y borran usuarios `+clerk_test`.
- [x] *Actions → CI → Run workflow* sobre `develop` (o avisame y lo relanzo).
- [x] *Verificar:* el job E2E ya no saltea las suites de registro, onboarding, configuración, leads, bandeja y dashboard, y pasan.

## 4. Email (Resend, ADR 0006)

- [ ] Crear la cuenta y *Domains → Add domain* con el dominio de envío. Cargar los registros DNS (SPF, DKIM y, recomendado, DMARC) en tu proveedor de DNS.
- [ ] *API Keys →* crear una con permiso de envío.
- [ ] *Verificar:* el dominio figura como **Verified**.

## 5. Errores (Sentry, ADR 0008)

- [x] Crear el proyecto (plataforma Next.js) y copiar el **DSN**.
  - Organización `valtiq` (región US), proyecto `brainance-app`.
  - Solo *Error monitoring*: Replay, Tracing, Profiling, Logging y Metrics desactivados.
  - *Security & Privacy:* Data Scrubber y Default Scrubbers activados, y no se guardan IPs. Es una segunda capa: la primera es `sentry-scrub.ts`.
  - `SENTRY_DSN` y `NEXT_PUBLIC_SENTRY_DSN` van como *Config*, porque el DSN es público. Por ahora solo en Preview.
- [ ] Opcional, para ver los errores con el código fuente: *Settings → Auth Tokens →* crear un token con permiso de releases.
- [x] *Monitors & Alerts →* "A new issue is created" → email a Ivan. La regla por defecto, de alta prioridad, también queda activa.
- [x] *Verificar* en una preview, con la sesión iniciada. Hecho el 2026-10-07 (issue BRAINANCE-APP-1): `environment: preview`, `area: debug`, `email` y `text` en `[redacted]`, sin IP ni request, y la alerta se disparó.
  1. Abrir `<URL de la preview>/api/debug/sentry`. Tiene que responder `"sent": true`.
  2. En Sentry aparece el issue "Prueba de Sentry (BrAInance)", con el tag `area: debug`.
  3. En *Additional Data*, `email` y `text` dicen `[redacted]`.

  La ruta solo existe en previews y en local (en producción da 404) y pide sesión.

## 6. Vercel: proyecto, IA y variables

### Proyecto

- [x] Proyecto `brainance-app`, importado de GitHub con el preset de Next.js.
- [x] *Settings → Environments → Production → Branch Tracking:* `main`.
  - `main` es producción y todo lo demás, `develop` incluida, sale como preview (`docs/workflow.md`).
  - Para una preview de `develop` sin push: *Deployments → … → Create Deployment →* `develop`.
- [x] *Settings → Functions → Function Region:* São Paulo (`gru1`), la misma región que Neon. El plan Hobby admite una sola.

### IA (Vercel AI Gateway, ADR 0001)

- [x] *Settings → Security → OIDC Federation:* modo "Team".
  - Cada deploy recibe un `VERCEL_OIDC_TOKEN` temporal que AI Gateway acepta solo.
  - Por eso **no se carga `AI_GATEWAY_API_KEY` en Vercel**: la key queda solo para el eval local (paso 8).
- [x] *AI Gateway → Credits:* crédito pago cargado. Haiku 4.5 no entra en el crédito gratuito mensual. Es una compra única, sin recarga automática, y vence al año.
- [x] *AI Gateway → Budgets & Spend → Spend Limit:* 20 USD por mes, con emails al 50 % y al 100 %.
  - El email al 50 % funciona como aviso; AI Gateway no ofrece alertas sin corte.
  - Además, cada sitio tiene su propio tope diario (`AI_SITE_DAILY_COST_USD`, ADR 0008).

### Variables

*Project → Settings → Environment Variables.* **P** = Production, **V** = Preview. Las que empiezan con `NEXT_PUBLIC_` llegan al navegador y van como *Config*; las claves y contraseñas, como *Secret*. Para elegir el entorno: *Environments → Environments* (no "Preview Branches", que es para ramas puntuales).

| Variable | P | V | Valor |
|---|---|---|---|
| `DATABASE_URL`, `DIRECT_URL` | ✓ | ✓ | Neon: branch `production` en P y `development` en V; `DATABASE_URL` con pooling (`-pooler`), `DIRECT_URL` sin pooling |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | ✓ | ✓ | Clerk: producción en P y desarrollo en V |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✓ | ✓ | `/auth/sign-in`, `/auth/sign-up` |
| `NEXT_PUBLIC_APP_URL` | ✓ |   | URL pública de producción (en Preview se usa la URL de la rama, `*-git-develop-*.vercel.app`, que conserva la sesión y sobrevive a cada deploy) |
| `NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY` | ✓ | ✓ | Uploadcare, proyecto `brainance` → API keys → Public key (*Config*: no es secreta) |
| `NEXT_PUBLIC_UPLOAD_CARE_CDN_URL` | ✓ | ✓ | Uploadcare → Delivery: el dominio propio del proyecto (`https://4gj75fw3od.ucarecd.net`) |
| `AI_GATEWAY_API_KEY` |   |   | No hace falta en Vercel (OIDC). Solo en `.env.local` para el eval |
| `RESEND_API_KEY`, `EMAIL_FROM` | ✓ | ✓ | Resend; `EMAIL_FROM` del dominio verificado |
| `EMAIL_PROVIDER` |   | ✓ | `log` en V hasta conectar Resend (los emails van al log del deploy) |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | ✓ | ✓ | El mismo DSN en las dos |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | ✓ |   | Opcional (source maps) |
| `ADMIN_CLERK_IDS` | ✓ | ✓ | Tu `user_…` |
| `LEGAL_CONTACT_EMAIL`, `LEGAL_ENTITY` | ✓ | ✓ | Contacto y razón social, CUIT y domicilio |
| `LEGAL_REVIEWED` | ✓ |   | `true` recién después del paso 9 |
| `AI_SITE_DAILY_COST_USD` | opc. | opc. | Por defecto 2 |
| `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` | opc. | opc. | Pusher (ADR 0007); sin esto, todo anda por polling |

No cargar nunca `AI_ALLOW_MOCK_MODEL` ni `WIDGET_ALLOW_HTTP` en P.

**Uploadcare:**
- Proyecto `brainance`:
  - guardado automático activado;
  - subidas sin firma;
  - solo imágenes, hasta 2 MB.
- La cuenta está en una **prueba Pro hasta el 20/10**. Antes de esa fecha hay que revisar qué pasa sin tarjeta: si se agrega una, cobra Pro automáticamente.

Estado al 2026-10-06: cargadas en V las de Neon, Clerk (desarrollo), Uploadcare y `EMAIL_PROVIDER`. P sigue sin variables hasta tener dominio, Clerk de producción y Resend.

- [ ] *Verificar:* *Deployments →* un redeploy termina sin errores.

## 7. QA en la preview (criterios 3 y 4)

Usar una preview con las variables de V y un **sitio de prueba real con HTTPS** (por ejemplo, una página estática en Vercel o Netlify en un dominio propio).

**Probar el bot sin dominio:**
- La vista previa del chat en la configuración del sitio es solo visual.
- El chat real se abre directo en `<URL de la preview>/widget/<id del sitio>`. El id es el final de `/settings/<id>`.
- La restricción de dominio solo aplica cuando el chat se embebe en otra página.
- Así no se marca "Instalado", y el dashboard no muestra métricas hasta completar el checklist.

**Cuenta de prueba sin email real:** registrarse con `<algo>+clerk_test@example.com`. La instancia de desarrollo de Clerk acepta siempre el código `424242`.

- [ ] Registro con email; aparece el aviso de términos con enlaces. Registro con Google.
- [ ] Onboarding: agregar el sitio del dominio de prueba; el dominio inválido se rechaza en español.
- [ ] Configuración: negocio (descripción, trato, contacto), color, ícono (sube a Uploadcare), bienvenida y tres preguntas frecuentes; la vista previa cambia antes de guardar.
- [ ] Pegar el snippet en el sitio de prueba: aparece el chat y el onboarding marca "Instalado".
- [ ] Conversar: el bot responde con el modelo real usando las FAQ y deriva al contacto ante algo desconocido; la conversación queda "Necesita atención".
  - 2026-10-06: el bot respondió bien, en unos 2 s, y derivó al WhatsApp. La conversación **no** quedó marcada porque el modelo reformuló el contacto.
  - Corregido en la detección (spec 006). Falta repetir la prueba con ese arreglo.
- [ ] Dejar un lead: llega el email al dueño (Resend) y responderlo le escribe al email del lead. El enlace "Más información" abre `/privacidad`.
- [ ] Bandeja: tomar el control, responder; el visitante ve el aviso y el mensaje sin recargar. Devolver al bot.
- [ ] Leads: exportar CSV (se abre bien en Excel o Sheets) y borrar el lead.
- [ ] Dashboard: los números coinciden con lo hecho; `/admin` muestra el costo del sitio y otro usuario recibe 404.
- [ ] Sentry: forzar un error (por ejemplo, una clave de gateway inválida en una preview aparte) y verificar que llega sin texto de la conversación ni emails.
- [ ] `ModelCall`: cada respuesta tiene modelo servido, tokens y costo. Comparar el costo con el panel del AI Gateway.
- [ ] Celular: el chat ocupa la pantalla; la bandeja va de la lista a la conversación.

Abrir un issue por cada falla y enlazarlo acá.

## 8. Eval de respuestas (ADR 0001)

- [x] Crear una key aparte para el eval (*Vercel → AI Gateway → API Keys*, por ejemplo `brainance-eval`) y cargarla en GitHub como secret `AI_GATEWAY_API_KEY` (*Repo → Settings → Secrets and variables → Actions*). No va en Vercel: la app usa OIDC (paso 6).
- [x] *Actions → Correr eval de respuestas → Run workflow* sobre `develop`, con el modelo de producción (`anthropic/claude-haiku-4.5`) y 2 repeticiones. La primera vez, tildar **Aprobar el harness**. Cuesta unos US$ 2 a 4 y tarda entre 20 y 60 minutos. Si el AI Gateway rechaza llamadas por límite de uso ("No access to this model at this time"), el workflow hace hasta cuatro pasadas con pausas y retoma solo lo que falló; el log dice cuántos errores fueron del juez (`judge_error`). Si son todos del juez, se puede relanzar con otro modelo juez (campo **Modelo juez**, por ejemplo `anthropic/claude-sonnet-5.5`).
- [x] El workflow sube los resultados a una rama `eval/rag-answers-<fecha>-<n>` con `src/content/eval/rag-answers.json` (spec 013). Abrir un PR contra `develop`: al mergearlo, la portada y `/como-medimos` muestran los números si llegan al umbral (95 % sin inventar y 85 % correctas).
- [x] *Verificar:* el resumen del job cumple los umbrales del ADR 0001 y de la spec 013. Si no llega, la portada sale sin números y se mejora el prompt antes (con su propio eval). Llegó en la tercera corrida, después de dos ajustes del prompt (2026-10-08, ver spec 013).
- Para correrlo en local: `AI_GATEWAY_API_KEY` en `.env.local`, `npm run eval:rag -- --variant baseline --model anthropic/claude-haiku-4.5 --reps 2` y después `npm run eval:publish` (ver `evals/rag-answers/README.md`).

## 9. Legal (bloquea la apertura)

- [ ] Revisión de `/terminos` y `/privacidad` (`src/content/legal/*.md`) por un abogado. Puntos a confirmar:
  - el texto exacto de la leyenda de la AAIP;
  - la inscripción de bases de datos ante la AAIP;
  - las transferencias internacionales (proveedores fuera de Argentina);
  - la afirmación de que los proveedores de IA no entrenan con las conversaciones, según sus términos vigentes;
  - la edad mínima y la ley aplicable.
- [ ] Cargar `LEGAL_CONTACT_EMAIL` y `LEGAL_ENTITY`. Con la revisión aprobada, `LEGAL_REVIEWED=true` y subir `TERMS_VERSION` en `src/domain/legal.ts` si el texto cambió.

## 10. Abrir la beta

- [ ] Todos los pasos anteriores marcados o con su issue aceptado.
- [ ] Promover a producción, revisar Sentry y `/admin` durante el primer día e invitar a los primeros negocios.
