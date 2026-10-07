# Roadmap

## Fase 0: Base ✅

- [x] Sacar `.env` del repo y crear `.env.example`
- [x] Actualizar a Next 16, React 19, Clerk 7 y Prisma 7
- [x] Vitest, Playwright y CI en GitHub Actions
- [x] Documentación del flujo, principios y ADRs iniciales
- Los pasos manuales de despliegue (credenciales, base, proveedores, secrets y QA) están en [docs/lanzamiento.md](lanzamiento.md).

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

## Lanzamiento

- **Lanzamiento de la beta** ([spec 008](specs/008-lanzamiento-de-la-beta.md)): checklist de despliegue y QA, términos y privacidad, limpieza del código heredado.
- **Landing con personalidad** ([spec 009](specs/009-landing.md)): dirección editorial, demo con el widget real y figuras de Hairline.
- **Aviso al dueño** ([spec 010](specs/010-aviso-al-dueno.md)): email con motivo, últimos intercambios y link a la conversación cuando el bot deriva, el visitante pide una persona o el sitio llega al tope; un recordatorio si el visitante sigue esperando. Primera prueba del posicionamiento.

## Posicionamiento

- **[Posicionamiento](posicionamiento.md):** para quién es, el problema en palabras del dueño, la promesa ("Ningún cliente sin respuesta. Y vos te enterás solo cuando hace falta.") y las tres pruebas que la sostienen. Cada spec y titular se contrasta contra esa página.
- **Mercado de chat con IA para pymes** ([análisis 2026-10](mercado/2026-10-chat-ia-pymes.md)): qué tienen en común los competidores, dónde no competir y seis huecos verificados. Propone como próximos pasos el aviso al dueño cuando una conversación necesita atención, un titular centrado en la honestidad y un tope de gasto visible.

## v1: después de la beta

Se mantiene en el backlog para iterar cuando la beta valide el producto:

- Citas y reservas (`Bookings`, portal público)
- Pagos y planes con Stripe
- Email marketing (`Campaign`)
- Productos y checkout desde el chat
- Blog (WordPress)
- Routing avanzado de modelos y modelo de decisiones (por ejemplo, Jev) para clasificación (ver ADR 0001)
