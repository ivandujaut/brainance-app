# 008 — Lanzamiento de la beta

- **Estado:** Borrador
- **ADRs relacionados:** [0002 — Base de datos](../adr/0002-base-de-datos-neon-vs-supabase.md), [0004 — Aislamiento multi-tenant](../adr/0004-aislamiento-multi-tenant.md), [0005 — Design system](../adr/0005-design-system-tokens-de-marca.md), [0008 — Errores y métricas](../adr/0008-errores-y-metricas.md)

## Problema

Las funciones de la beta están completas, pero el producto todavía no se puede abrir a usuarios:

- **Nunca se probó de punta a punta con Clerk.** Las seis suites E2E que necesitan sesión (registro, onboarding, configuración, leads, bandeja y dashboard) siempre se saltearon por falta de claves, y los pasos manuales de despliegue están dispersos en varios PRs.
- **No hay términos de uso ni política de privacidad.** El producto guarda emails y conversaciones de los visitantes de terceros (ley 25.326).
- **Lo primero que ve un visitante de BrAInance es código heredado del clon original:** la portada está en inglés, con planes pagos que no existen y un blog de WordPress que no está conectado. La página de cuenta (`/settings`) también está en inglés y muestra facturación. Quedan además una ruta de citas vacía, modelos sin uso y columnas viejas.

## Historias de usuario

- Como **responsable de BrAInance**, quiero una lista ordenada de lo que tengo que configurar para desplegar, y saber que el producto funciona de punta a punta antes de invitar a los primeros negocios.
- Como **dueño de un negocio**, quiero saber qué hace BrAInance con mis datos y con los de mis clientes antes de registrarme.
- Como **visitante del sitio de un negocio**, quiero poder leer para qué se usan los datos que dejo en el chat.
- Como **visitante de brainance**, quiero entender en español qué es el producto y cómo empezar.

## Criterios de aceptación

### Parte A: despliegue y QA (primero)

1. **Dado** `docs/lanzamiento.md`, **entonces** lista en orden cada paso manual con dónde se hace y cómo se verifica:
   - rotación de credenciales;
   - base y migraciones;
   - variables por entorno (Production y Preview);
   - Clerk (Google, dominios y URLs);
   - secrets de GitHub;
   - Resend, Sentry y Pusher;
   - el eval.
2. **Dado** los secrets `E2E_CLERK_*` cargados en GitHub, **cuando** corre el CI, **entonces** las suites de registro, onboarding, configuración, leads, bandeja y dashboard pasan. Si alguna falla, se arregla en este PR (o, si es un error de la feature, en un PR aparte enlazado acá).
3. **Dado** un despliegue de preview en Vercel con la configuración de producción (claves reales, salvo Pusher, que es opcional), **cuando** se sigue el guion de QA manual de `docs/lanzamiento.md`, **entonces** cada paso se marca como OK o queda un issue abierto. El guion cubre registro con email y con Google, agregar un sitio, configurar el bot, instalar el widget en un sitio de prueba, conversar, dejar un lead, recibir el email, tomar el control y ver las métricas y `/admin`.
4. **Dado** un sitio de prueba real (no simulado), **cuando** se pega el snippet, **entonces** el widget carga, responde con el modelo real, se registra en `ModelCall` y un error forzado llega a Sentry sin datos personales.

### Parte B: términos y privacidad

5. **Dado** cualquier persona, **cuando** entra a `/terminos` o `/privacidad`, **entonces** ve las páginas en español, públicas (sin sesión), con fecha de vigencia y un contacto.
6. **Dado** la política de privacidad, **entonces** describe lo que el producto hace hoy, verificado contra el código:
   - qué datos guarda del dueño (cuenta en Clerk, sitios, configuración) y de los visitantes (identificador anónimo, conversaciones, email y respuestas si los dejan);
   - para qué;
   - que el dueño es el responsable de los datos de sus visitantes y BrAInance el encargado de tratarlos;
   - qué proveedores intervienen y para qué: Neon, Vercel, Clerk, Resend, Sentry, Pusher, la gateway de IA de Vercel y el proveedor del modelo;
   - cuánto tiempo se guardan los datos;
   - cómo pedir acceso, rectificación o borrado, y la autoridad de control (AAIP).
7. **Dado** el registro, **cuando** una persona crea su cuenta, **entonces** ve "Al registrarte aceptás los Términos y la Política de privacidad" con enlaces, y la fecha de aceptación y la versión de los términos quedan guardadas en su usuario.
8. **Dado** la tarjeta de leads del widget (spec 005), **entonces** el aviso de uso de datos suma el enlace "Más información" a `/privacidad`, que se abre en una pestaña nueva.
9. **Dado** que los textos legales son un borrador técnico, **entonces** las páginas y `docs/lanzamiento.md` indican que deben ser revisados por un abogado antes de abrir la beta, y la apertura queda condicionada a esa revisión (es un paso de la checklist).

### Parte C: limpieza

10. **Dado** la portada (`/`), **entonces** está en español y muestra:
    - qué es BrAInance;
    - cómo funciona en tres pasos;
    - un llamado a registrarse gratis (la beta solo tiene plan gratuito);
    - los enlaces legales.

    No muestra precios de planes que no existen ni el blog de WordPress.
11. **Dado** la página de cuenta (`/settings`), **entonces** está en español, permite cambiar la contraseña y el tema, y no muestra facturación.
12. **Dado** el código heredado que la beta no usa (ruta de citas, blog, planes y facturación, componentes y acciones sin referencias), **entonces** se elimina. Queda preservado en el tag de git `legado-corinna`, para retomarlo en la v1 (roadmap).
13. **Dado** el esquema, **entonces** una migración elimina:
    - las columnas sin uso `User.type`, `ChatBot.textColor`, `ChatBot.helpdesk`, `ChatRoom.live`, `ChatRoom.mailed` y `FilterQuestions.answered`;
    - las tablas `Bookings`, `Campaign` y `Product`, si están vacías en producción; si tienen datos, se exportan antes.
14. **Dado** el menú lateral, **entonces** solo muestra lo que existe en la beta (Dashboard, Conversaciones, Leads, Configuración) y sus textos están en español.
15. **Dado** las pantallas que esta limpieza toca, **entonces** usan solo tokens del design system (ADR 0005). Los colores sueltos que queden en pantallas no tocadas siguen en la lista de deuda.

## Fuera de alcance

- Planes pagos, Stripe y facturación (v1).
- Blog, citas, campañas de email y productos (v1, preservados en el tag).
- Un "centro de privacidad" con exportación automática de datos: los pedidos se atienden por email en la beta.
- Cookies de analítica o banner de cookies: el producto no usa cookies de analítica. Las de Clerk son estrictamente necesarias y la política lo explica.
- Traducción a otros idiomas.

## Notas técnicas

**Parte A**
- `docs/lanzamiento.md` es la fuente única de pasos manuales. Reemplaza los "Antes de desplegar" de cada PR y la sección manual de `docs/roadmap.md`.
- Si una suite E2E falla al correr con claves reales por primera vez, se diagnostica igual que un CI rojo: se busca la causa, sin reintentos a ciegas y sin desactivar tests.

**Parte B**
- Las páginas legales son Server Components estáticos en `(site)`, agregados a `isPublicRoute`. El texto vive en `src/content/legal/*.md` (fácil de revisar y versionar para el abogado) y se renderiza con los tokens.
- `User` suma `termsAcceptedAt DateTime?` y `termsVersion String?`. `ensureUser` los completa en el alta. La versión vigente está en `src/domain/legal.ts` (`TERMS_VERSION`).
- Los usuarios existentes antes del cambio aceptan en su próximo ingreso con un aviso no bloqueante. Hoy no hay usuarios reales, así que alcanza con eso.

**Parte C**
- Antes de borrar, el tag `legado-corinna` se crea sobre `develop` (paso manual si el proxy no permite pushear tags).
- La eliminación es mecánica: se verifica con `npm run lint && npm run typecheck && npm test`, `next build` y una búsqueda de imports huérfanos.
- La migración de limpieza va en su propio commit. Antes de aplicarla en producción, la checklist pide verificar que `Bookings`, `Campaign` y `Product` están vacías.

**IA**
- El prompt no cambia. El eval se corre como parte de la checklist (Parte A), porque nunca corrió con la clave real.

## Riesgos y preguntas abiertas

- **Revisión legal:** el borrador no reemplaza a un abogado. Sin esa revisión, la beta no se abre.
- **Inscripción de bases de datos:** la ley 25.326 contempla registrar las bases de datos personales ante la AAIP. La checklist lo incluye como consulta al abogado.
- **Fallas al correr por primera vez los E2E con Clerk:** es probable que alguna suite falle. Por eso la Parte A va primero y puede sumar arreglos a este PR.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 2 | E2E con Clerk (las seis suites existentes) | `e2e/*.spec.ts` |
| 3, 4 | QA manual guionado en la preview | `docs/lanzamiento.md` |
| 5, 6, 8 | E2E: páginas legales públicas y enlace desde la tarjeta de leads | `e2e/legal.spec.ts`, `e2e/widget-leads.spec.ts` |
| 7 | Integración: el alta guarda la aceptación y la versión | `src/server/users.int.test.ts` |
| 7 | E2E (requiere Clerk): el registro muestra el aviso con enlaces | `e2e/auth.spec.ts` |
| 10, 11, 14 | Render: portada, cuenta y menú en español, sin precios ni blog | tests de página y `e2e/smoke.spec.ts` |
| 12, 13 | Build, typecheck y la suite completa después de borrar; la migración se aplica sobre una base con datos de prueba | CI |
