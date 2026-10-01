# BrAInance

SaaS de chatbots con IA para sitios web. Un negocio registra sus dominios, entrena un bot con sus preguntas frecuentes y documentos, y lo inserta en su web con un snippet. El bot responde a los visitantes, captura leads y deriva a una persona cuando hace falta.

> Estado: en camino a la **beta**. Ver [`docs/roadmap.md`](docs/roadmap.md).

## Stack

- **Next.js 16** (App Router, Server Actions) · **React 19** · TypeScript
- **Clerk 7** para autenticación
- **Prisma 7** sobre PostgreSQL (con pgvector para RAG); ver [ADR 0002](docs/adr/0002-base-de-datos-neon-vs-supabase.md)
- Tailwind CSS · shadcn/ui (Radix)
- IA multi-proveedor vía AI SDK y Vercel AI Gateway; ver [ADR 0001](docs/adr/0001-estrategia-de-modelos-de-ia.md)
- Tests: Vitest (unitarios) y Playwright (E2E)

## Empezar

```bash
cp .env.example .env.local   # completar las variables
npm install                  # también corre `prisma generate`
npx prisma migrate dev       # aplica el esquema a tu base local
npm run dev
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Chequeo de tipos de TypeScript |
| `npm test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright; requiere claves de Clerk) |

## Cómo trabajamos

- [Flujo de desarrollo](docs/workflow.md): spec → ADR → tests → implementación → PR + CI → preview + QA → deploy
- [Principios de ingeniería](docs/principles.md): capas, multi-tenancy, seguridad e IA
- [Specs](docs/specs/) y [decisiones de arquitectura (ADRs)](docs/adr/)
