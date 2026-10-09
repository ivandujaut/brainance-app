# Base de datos

Reglas para `prisma/`. Las generales están en el [`AGENTS.md` de la raíz](../AGENTS.md).

- **Los cambios de esquema van con migración** (`npx prisma migrate dev --name <cambio>`), nunca con `db push` en una base compartida.
- **Después de cambiar el esquema,** si faltan tipos, corré `npx prisma generate`. El cliente se genera en `src/generated/prisma/` y no se commitea.
- **Para probar una migración desde cero,** usá una base vacía aparte (por ejemplo, `brainance_migrate`) antes de correrla sobre la de tests.
- **El dueño aplica las migraciones** a las bases de Neon (desarrollo y producción) con el workflow `migrate.yml`. Un PR con migración lo dice en su checklist.
