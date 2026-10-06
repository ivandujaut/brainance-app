# Lanzamiento de la beta: checklist

Única fuente de los pasos manuales para desplegar BrAInance (spec 008). Se sigue en orden; cada paso dice **dónde** se hace y **cómo verificarlo**. Las claves se pegan directamente en cada proveedor: nunca en el chat, en issues ni en commits.

> Estado: marcá cada casilla en el PR que cierre el lanzamiento.

## 0. Seguridad (antes que nada)

- [ ] **Rotar las credenciales que quedaron en el historial de git** (el `.env` original se commiteó en el repo heredado):
  - Clerk: *Dashboard → API Keys →* regenerar la secret key de la instancia vieja (o borrar esa instancia).
  - Uploadcare: *Dashboard → API keys →* crear un par nuevo y revocar el viejo.
  - Base de datos vieja: cambiar la contraseña o borrar esa base.
  - *Verificar:* las claves viejas dejan de funcionar.
- [ ] **Tag del código heredado.** El tag `legado-corinna` existe en el entorno de desarrollo, pero el push no pasó por el proxy. Crearlo desde tu máquina: `git fetch origin && git tag legado-corinna a423390 && git push origin legado-corinna` (a423390 es `develop` antes de la limpieza). *Verificar:* aparece en *GitHub → Tags*.

## 1. Base de datos (Neon, ADR 0002)

- [ ] Crear el proyecto `brainance` en Neon: AWS São Paulo (`aws-sa-east-1`), Postgres 16 (el mismo que CI), base `brainance`. Branches: `production` y `development` (para las previews, sin vencimiento).
- [ ] Cada branch tiene dos cadenas de conexión (*Connect*): la **pooled**, con `-pooler` en el host (`DATABASE_URL` en Vercel), y la **directa** (`DIRECT_URL`, para migrar).
- [ ] *GitHub → Settings → Secrets and variables → Actions:* cargar las cadenas **directas**:
  - `NEON_DIRECT_URL`: branch `production`.
  - `NEON_DEV_DIRECT_URL`: branch `development`.
- [ ] Aplicar las migraciones: *Actions → Migrar base → Run workflow*, primero con `development` y después con `production`. El workflow (`.github/workflows/migrate.yml`) rechaza una cadena con pooler y oculta el host en el log.
  - Alternativa desde tu máquina: `DIRECT_URL="<directa>" npx prisma migrate deploy`.
  - Si la base se creó antes con `db push`, primero: `npx prisma migrate resolve --applied 20261001000000_init`.
  - La migración `20261007120000_remove_legacy` se frena sola si `Bookings`, `Campaign` o `Product` tienen filas. En ese caso, exportalas y vaciá las tablas antes.
- [ ] *Verificar:* el último paso del workflow ("Check the schema is up to date") dice "Database schema is up to date!".

## 2. Clerk (cuentas)

- [ ] Crear la **instancia de producción** y conectar el dominio de la app.
- [ ] *User & authentication → Social connections →* habilitar **Google**, con credenciales propias de Google Cloud en producción.
- [ ] *Paths:* sign-in `/auth/sign-in`, sign-up `/auth/sign-up`, redirección después del ingreso `/dashboard`.
- [ ] Anotar tu **user id** (*Users →* tu usuario →* `user_…`) para `ADMIN_CLERK_IDS`.
- [ ] *Verificar:* podés registrarte con email y con Google en la preview (paso 7).

## 3. GitHub (CI)

- [ ] *Repo → Settings → Secrets and variables → Actions → New repository secret:*
  - `E2E_CLERK_PUBLISHABLE_KEY` y `E2E_CLERK_SECRET_KEY`, de la instancia de **desarrollo** de Clerk (no la de producción). Los tests crean y borran usuarios `+clerk_test`.
- [ ] *Actions → CI → Run workflow* sobre `develop` (o avisame y lo relanzo).
- [ ] *Verificar:* el job E2E ya no saltea las suites de registro, onboarding, configuración, leads, bandeja y dashboard, y pasan.

## 4. Email (Resend, ADR 0006)

- [ ] Crear la cuenta y *Domains → Add domain* con el dominio de envío. Cargar los registros DNS (SPF, DKIM y, recomendado, DMARC) en tu proveedor de DNS.
- [ ] *API Keys →* crear una con permiso de envío.
- [ ] *Verificar:* el dominio figura como **Verified**.

## 5. Errores (Sentry, ADR 0008)

- [ ] Crear el proyecto (plataforma Next.js) y copiar el **DSN**.
- [ ] Opcional, para ver los errores con el código fuente: *Settings → Auth Tokens →* crear un token con permiso de releases.
- [ ] *Alerts →* una regla de "nuevo issue" que mande email.

## 6. Variables en Vercel

*Project → Settings → Environment Variables.* **P** = Production, **V** = Preview.

| Variable | P | V | Valor |
|---|---|---|---|
| `DATABASE_URL`, `DIRECT_URL` | ✓ | ✓ | Neon (para Preview, idealmente una branch de Neon aparte) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | ✓ | ✓ | Clerk: producción en P y desarrollo en V |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✓ | ✓ | `/auth/sign-in`, `/auth/sign-up` |
| `NEXT_PUBLIC_APP_URL` | ✓ |   | URL pública de producción (en Preview se usa la propia) |
| `NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY` | ✓ | ✓ | Uploadcare (la clave nueva del paso 0) |
| `AI_GATEWAY_API_KEY` | ✓ | ✓ | Vercel AI Gateway |
| `RESEND_API_KEY`, `EMAIL_FROM` | ✓ | ✓ | Resend; `EMAIL_FROM` del dominio verificado |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | ✓ | ✓ | El mismo DSN en las dos |
| `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | ✓ |   | Opcional (source maps) |
| `ADMIN_CLERK_IDS` | ✓ | ✓ | Tu `user_…` |
| `LEGAL_CONTACT_EMAIL`, `LEGAL_ENTITY` | ✓ | ✓ | Contacto y razón social, CUIT y domicilio |
| `LEGAL_REVIEWED` | ✓ |   | `true` recién después del paso 9 |
| `AI_SITE_DAILY_COST_USD` | opc. | opc. | Por defecto 2 |
| `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` | opc. | opc. | Pusher (ADR 0007); sin esto, todo anda por polling |

No cargar nunca `AI_ALLOW_MOCK_MODEL` ni `WIDGET_ALLOW_HTTP` en P.

- [ ] *Verificar:* *Deployments →* un redeploy termina sin errores.

## 7. QA en la preview (criterios 3 y 4)

Usar una preview con las variables de V y un **sitio de prueba real con HTTPS** (por ejemplo, una página estática en Vercel o Netlify en un dominio propio).

- [ ] Registro con email; aparece el aviso de términos con enlaces. Registro con Google.
- [ ] Onboarding: agregar el sitio del dominio de prueba; el dominio inválido se rechaza en español.
- [ ] Configuración: negocio (descripción, trato, contacto), color, ícono (sube a Uploadcare), bienvenida y tres preguntas frecuentes; la vista previa cambia antes de guardar.
- [ ] Pegar el snippet en el sitio de prueba: aparece el chat y el onboarding marca "Instalado".
- [ ] Conversar: el bot responde con el modelo real usando las FAQ y deriva al contacto ante algo desconocido; la conversación queda "Necesita atención".
- [ ] Dejar un lead: llega el email al dueño (Resend) y responderlo le escribe al email del lead. El enlace "Más información" abre `/privacidad`.
- [ ] Bandeja: tomar el control, responder; el visitante ve el aviso y el mensaje sin recargar. Devolver al bot.
- [ ] Leads: exportar CSV (se abre bien en Excel o Sheets) y borrar el lead.
- [ ] Dashboard: los números coinciden con lo hecho; `/admin` muestra el costo del sitio y otro usuario recibe 404.
- [ ] Sentry: forzar un error (por ejemplo, una clave de gateway inválida en una preview aparte) y verificar que llega sin texto de la conversación ni emails.
- [ ] `ModelCall`: cada respuesta tiene modelo servido, tokens y costo. Comparar el costo con el panel del AI Gateway.
- [ ] Celular: el chat ocupa la pantalla; la bandeja va de la lista a la conversación.

Abrir un issue por cada falla y enlazarlo acá.

## 8. Eval de respuestas (ADR 0001)

- [ ] Con `AI_GATEWAY_API_KEY` en `.env.local`: `npm run eval:rag -- --variant beta --model anthropic/claude-haiku-4.5` (ver `evals/rag-answers/README.md`). Incluye el caso con historial del dueño (`cd-takeover-01`).
- [ ] *Verificar:* el resumen cumple los umbrales del ADR 0001. Guardar el resultado en `evals/rag-answers/results/`.

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
