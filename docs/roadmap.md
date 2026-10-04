# Roadmap

## Fase 0: Base ✅

- [x] Sacar `.env` del repo y crear `.env.example`
- [x] Actualizar a Next 16, React 19, Clerk 7 y Prisma 7
- [x] Vitest, Playwright y CI en GitHub Actions
- [x] Documentación del flujo, principios y ADRs iniciales
- [ ] **Rotar las credenciales que quedaron en el historial de git** (Clerk, Uploadcare, base de datos) *(manual)*
- [ ] Configurar en GitHub los secrets `E2E_CLERK_PUBLISHABLE_KEY` y `E2E_CLERK_SECRET_KEY` *(manual)*
- [ ] Crear el proyecto en Vercel y la base de datos según el ADR 0002 *(manual)*

## Beta: "pongo un bot en mi web y me trae leads"

Cada ítem va a tener su spec en `docs/specs/`.

1. **Registro y onboarding** ([spec 002](specs/002-registro-y-onboarding.md)): alta de cuenta, primer dominio y snippet de instalación.
2. **Dominios**: alta, baja y límites por plan (solo plan gratuito en la beta).
3. **Configuración del bot** ([spec 004](specs/004-configuracion-del-bot.md)): mensaje de bienvenida, apariencia, FAQ (helpdesk) y preguntas de calificación.
4. **Base de conocimiento (RAG)**: carga de FAQ y documentos con embeddings en pgvector.
5. **Widget embebible** ([spec 003](specs/003-widget-embebible.md)): script que se agrega al sitio del cliente y abre el chat.
6. **Respuestas con IA** ([spec 001](specs/001-respuestas-con-ia.md)): capa de IA según el ADR 0001, con eval set en español.
7. **Captura de leads** ([spec 005](specs/005-captura-de-leads.md)): preguntas de calificación y guardado del email.
8. **Bandeja de conversaciones** ([spec 006](specs/006-bandeja-de-conversaciones.md)): listado, lectura y toma de control humana en tiempo real.
9. **Observabilidad** ([spec 007](specs/007-observabilidad.md)): Sentry, y costo y latencia por conversación.

## v1: después de la beta

Se mantiene en el backlog para iterar cuando la beta valide el producto:

- Citas y reservas (`Bookings`, portal público)
- Pagos y planes con Stripe
- Email marketing (`Campaign`)
- Productos y checkout desde el chat
- Blog (WordPress)
- Routing avanzado de modelos y modelo de decisiones (por ejemplo, Jev) para clasificación (ver ADR 0001)
