# E2E

Reglas para `e2e/`. Las generales están en el [`AGENTS.md` de la raíz](../AGENTS.md).

- **Antes de correrlos:** `npm run build`, y matá los servidores `next` que hayan quedado de otra corrida.
- **Chromium preinstalado** (sandboxes, sesiones en la nube): `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e`. No corras `playwright install`.
- **Los del widget no necesitan Clerk.** Levantan la app con:
  - `WIDGET_ALLOW_HTTP=true AI_ANSWER_MODEL=mock/echo AI_ALLOW_MOCK_MODEL=true`;
  - una base migrada en `DATABASE_URL` (por ejemplo, `brainance_e2e`).
- **Los de registro y onboarding** se saltean si falta `CLERK_SECRET_KEY`.
- **Clerk de desarrollo tiene límite de pedidos.** Si dos corridas de E2E se pisan, los helpers que crean y borran usuarios reciben 429 ("Too Many Requests"), y fallan tests que no tienen nada que ver con el cambio. Por eso el CI corre un solo job de E2E a la vez (`concurrency: e2e-clerk`). Si un E2E aparece cancelado en un PR, volvé a correrlo.
- **Para esperar algo que escribe el servidor** (un mensaje guardado, una marca), usá `expect.poll`, no un `waitForTimeout`.
- **Si un test siembra mensajes,** usá los helpers de `e2e/support`, que les ponen fechas crecientes. Dos mensajes en el mismo milisegundo cambian el orden.
