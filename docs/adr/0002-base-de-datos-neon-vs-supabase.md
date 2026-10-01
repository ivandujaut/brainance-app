# 0002 — Base de datos: Neon vs Supabase

- **Estado:** Propuesto
- **Fecha:** 2026-10-01

## Contexto

- El deploy va a Vercel y el acceso a datos es con Prisma 7. La auth ya la resuelve Clerk.
- Hace falta Postgres con **pgvector** para el RAG.
- El realtime (toma de control humana) está planeado con Pusher, y los archivos con Uploadcare.
- Equipo de una persona, beta sensible a costos y usuarios en Argentina y LatAm.

> Los precios salen de las páginas oficiales consultadas el 2026-10-01 a través de resúmenes de búsqueda. Hay que reconfirmarlos en neon.com/pricing y supabase.com/pricing antes de pagar.

## Comparación

| Criterio | Neon | Supabase |
|---|---|---|
| Plan gratuito | 0,5 GB por proyecto, sin pausa | 500 MB, **pausa tras 7 días sin actividad** |
| Primer plan pago | Launch: pago por uso, sin mínimo (≈ $10–25/mes para la beta) | Pro: $25/mes (≈ $25–30 con instancia Small) |
| Scale-to-zero | Sí (~500 ms de arranque en frío; se puede desactivar) | No en Pro (siempre encendido) |
| Previews de Vercel | **Una rama copy-on-write con datos por cada preview, en ~1 s y sin costo fijo** | Una instancia vacía por rama (con seed), cobrada por hora |
| Prisma | Pooler más URL directa; `@prisma/adapter-pg` o `@prisma/adapter-neon` | Supavisor (`pgbouncer=true`) más URL directa |
| pgvector + HNSW | Sí | Sí |
| Realtime | No (se mantiene Pusher) | Sí (Broadcast/Presence). El widget anónimo necesita tokens propios |
| Storage | No (se mantiene Uploadcare) | Sí (100 GB en Pro) |
| São Paulo (`sa-east-1`) | Sí | Sí |
| PITR | Incluido, hasta 7 días | Add-on pago (backups diarios incluidos) |
| Empresa | Comprada por Databricks (2025). Deprecó pg_search en 2026 | Independiente, bien capitalizada |

## Decisión propuesta

**Neon (plan Launch, región `aws-sa-east-1`) con las funciones de Vercel en `gru1` (São Paulo).**

1. El stack no usa lo que diferencia a Supabase: Clerk cubre la auth y Prisma el acceso a datos, así que no se usarían ni RLS, ni PostgREST, ni Supabase Auth.
2. Tiene la mejor integración con el flujo de trabajo (`docs/workflow.md`): cada PR obtiene una rama de base con datos para su preview, y el CI puede crear ramas efímeras.
3. Es lo más barato para la beta: sin mínimo y con scale-to-zero.
4. Salir es fácil: es Postgres estándar con Prisma, sin APIs propietarias.

El código usa `@prisma/adapter-pg`, que funciona con los dos proveedores. Si más adelante se migra, solo cambia la URL de conexión.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Que Databricks cambie el rumbo del producto (ya deprecó pg_search) | Usar solo pgvector y SQL estándar; backups periódicos con `pg_dump` fuera de Neon |
| Arranque en frío (~500 ms) en el primer mensaje del widget | Desactivar scale-to-zero en producción cuando haya tráfico real (≈ $19/mes a 0,25 CU) |
| Hace falta un proveedor de realtime aparte | Pusher detrás de una interfaz en `src/server/realtime/`; el plan gratuito (100 conexiones) alcanza para la beta |

## Cuándo reconsiderar Supabase

Si Pusher pasa a un plan pago ($49/mes) o si conviene reemplazar Pusher y Uploadcare por un solo proveedor, Supabase Pro (~$25–30/mes) puede salir más barato en total. El costo es resolver la autorización del widget anónimo en Supabase Realtime.

## Consecuencias

- `DATABASE_URL` usa el host con pooler y `DIRECT_URL` la conexión directa para migraciones (ver `.env.example` y `prisma.config.ts`).
- Instalar la integración de Neon en Vercel con "preview branching" activado.
- Configurar `regions: ["gru1"]` en Vercel.
- Los tests de integración en CI usan un contenedor `pgvector/pgvector` o una rama efímera de Neon.
