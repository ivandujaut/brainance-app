# 002 — Registro y onboarding

- **Estado:** Borrador
- **ADRs relacionados:** —

## Problema

Hoy el registro no lleva a ningún lado. Después de registrarse o iniciar sesión, el usuario cae en `/dashboard`, que no existe (404). Si falla la creación del usuario en la base después de crearlo en Clerk, la cuenta queda rota para siempre: el dashboard muestra una página en blanco. Además:

- Hay un paso que pregunta si el usuario es "dueño de un negocio" o "trabajador que gestiona sus impuestos". Es un resto del tutorial original.
- La contraseña no acepta símbolos y se pide confirmar el email.
- El validador de dominios rechaza terminaciones como `.store`.
- Toda la interfaz está en inglés.
- Nada guía al usuario nuevo hasta tener un bot funcionando.

## Historias de usuario

- Como **dueño de un negocio**, quiero registrarme con mi email o con Google en menos de un minuto para probar BrAInance.
- Como **usuario nuevo**, quiero saber qué me falta para tener el bot funcionando en mi sitio, y poder hacerlo a mi ritmo.
- Como **usuario que vuelve**, quiero entrar y llegar directo a mi panel.

## Criterios de aceptación

### Registro e ingreso

1. **Dado** un visitante en `/auth/sign-up`, **cuando** se registra con email (verificado con un código) o con Google, **entonces** llega a `/dashboard` con la sesión iniciada. Toda la interfaz está en español.
2. **Dado** un usuario registrado en `/auth/sign-in`, **cuando** ingresa con email o con Google, **entonces** llega a `/dashboard`.
3. **Dado** un usuario con sesión iniciada, **cuando** entra a `/auth/sign-in` o `/auth/sign-up`, **entonces** se lo redirige a `/dashboard`.
4. **Dado** un usuario de Clerk sin registro en la base (primer ingreso, o un alta anterior que falló), **cuando** entra al dashboard, **entonces** se crea su usuario con el plan STANDARD. Si entra varias veces a la vez, se crea una sola vez.
5. **Dado** que la creación del usuario en la base falla, **cuando** entra al dashboard, **entonces** ve un mensaje de error con un botón para reintentar, no una página en blanco.

### Onboarding

6. **Dado** un usuario sin sitios cargados, **cuando** entra a `/dashboard`, **entonces** ve una checklist con tres pasos, cada uno con su estado:
   1. **Agregá tu sitio:** nombre de dominio, ícono opcional.
   2. **Entrená a tu bot:** al menos 3 preguntas frecuentes. El mensaje de bienvenida se puede editar, pero ya tiene un valor por defecto.
   3. **Instalá el bot en tu sitio:** copiar el snippet y confirmar "Ya lo instalé".
7. **Dado** un dominio válido (incluidos `tienda.com.ar`, `mi-negocio.store` y `shop.ejemplo.com`), **cuando** el usuario lo agrega, **entonces** se crea el sitio con su bot y el paso 1 queda completo. Los dominios inválidos (`http://...`, `ejemplo`, `-ejemplo.com`) muestran un error en español.
8. **Dado** un usuario del plan STANDARD que ya tiene un sitio, **cuando** intenta agregar otro, **entonces** ve que su plan permite un solo sitio.
9. **Dado** un sitio con al menos 3 preguntas frecuentes, **entonces** el paso 2 queda completo.
10. **Dado** el paso 3, **cuando** el usuario abre el snippet, **entonces** ve uno que apunta a la URL de la app en ese entorno (no a `localhost`) e incluye el id de su sitio. **Cuando** confirma "Ya lo instalé", el paso 3 queda completo.
11. **Dado** que el usuario saltea un paso y navega a otra sección, **cuando** vuelve a `/dashboard`, **entonces** la checklist muestra el mismo progreso. El progreso se calcula de los datos, no de un flag aparte.
12. **Dado** que los tres pasos están completos, **entonces** la checklist deja de mostrarse.

## Fuera de alcance

- El widget del chat (`/chatbot`) y la detección automática de la instalación: van en la spec del widget. Ahí, el primer mensaje recibido desde el sitio también marcará el paso 3.
- Respuestas con IA (spec 001), base de conocimiento con documentos y la bandeja de conversaciones.
- Planes pagos, equipos o varios usuarios por cuenta, y borrado de cuenta.
- El contenido del dashboard más allá de la checklist (métricas, conversaciones recientes).

## Notas técnicas

**Autenticación**
- Se reemplazan los formularios propios por los componentes de Clerk `<SignUp />` y `<SignIn />` en rutas catch-all (`/auth/sign-up/[[...sign-up]]`, `/auth/sign-in/[[...sign-in]]`). Usan la traducción `esUY` de `@clerk/localizations` (rioplatense, con voseo) y los colores de la marca vía `appearance`.
- Se borran `src/components/forms/sign-up/`, `src/components/forms/sign-in/`, `src/hooks/sign-up/`, `src/hooks/sign-in/`, el contexto de auth y `UserRegistrationSchema`. Con esto desaparece la deuda de los hooks legacy de Clerk.
- Google se habilita en el dashboard de Clerk. En desarrollo usa las credenciales compartidas de Clerk; en producción hace falta un cliente OAuth propio de Google *(configuración manual)*.

**Alta del usuario en la base**
- Nueva función `ensureCurrentUser()` en `src/server/users.ts`: hace un `upsert` por `clerkId` (único) y crea `Billings` con plan STANDARD. Es idempotente y la llama el layout del dashboard en lugar de `onLoginUser`.
- No se usa un webhook de Clerk por ahora: el alta perezosa funciona en local sin túneles ni secretos extra, y repara cuentas rotas. Se puede sumar un webhook después para sincronizar bajas.
- `User.type` deja de usarse. La columna se elimina en una migración posterior para no mezclar cambios.

**Onboarding**
- Lógica pura en `src/domain/onboarding.ts`: `getOnboardingSteps(domains)`, donde cada dominio trae la cantidad de FAQ e `installedAt`.
- Validación de dominios en `src/domain/domains.ts` (`isValidDomain`). Reemplaza el regex actual del schema.
- Nueva columna `ChatBot.installedAt DateTime?`. La setea "Ya lo instalé" ahora y el widget después.
- Nueva variable `NEXT_PUBLIC_APP_URL` para el snippet.

**Primera migración de Prisma**
- El repo no tiene `prisma/migrations`; la base se creó con `db push`. Antes de agregar `installedAt` se genera una migración inicial que refleje el esquema actual. En las bases ya existentes se marca como aplicada con `prisma migrate resolve --applied`.

## Riesgos y preguntas abiertas

- **Personalización limitada:** los componentes de Clerk se personalizan con `appearance`, pero no se pueden reordenar libremente. Si hiciera falta un paso propio en el registro (por ejemplo, el rubro del negocio), se pide después del registro, en el onboarding.
- **Copy del snippet:** se confirma en la spec del widget.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 1, 2 | E2E con usuario de prueba de Clerk (`+clerk_test`, código 424242) | `e2e/auth.spec.ts` |
| 3 | E2E | `e2e/auth.spec.ts` |
| 4 | Integración (Postgres): dos llamadas concurrentes crean un solo usuario | `src/server/users.int.test.ts` |
| 5 | Unitario del layout con `ensureCurrentUser` que falla | `src/app/(dashboard)/layout.test.tsx` |
| 6, 9, 11, 12 | Unitario | `src/domain/onboarding.test.ts` |
| 7 | Unitario (casos válidos e inválidos) | `src/domain/domains.test.ts` |
| 8 | Unitario | `src/domain/plans.test.ts` (ya existe) |
| 10 | Unitario del generador de snippet + E2E de "Ya lo instalé" | `src/domain/snippet.test.ts`, `e2e/onboarding.spec.ts` |
| 6–12 (flujo completo) | E2E: registro → agregar sitio → 3 FAQ → instalar → checklist oculta | `e2e/onboarding.spec.ts` |
