# Flujo de desarrollo

Cada feature recorre el mismo camino. Es un proceso liviano pensado para un equipo chico: cada paso deja un artefacto en el repo, así cualquier persona (o una sesión de Claude) puede retomar el trabajo sin contexto previo.

```
Spec ─► ADR (si hay decisión de arquitectura) ─► Tests ─► Implementación ─► PR + CI ─► Review ─► Preview + QA ─► Merge ─► Deploy
```

## 1. Spec

- Archivo: `docs/specs/NNN-nombre-corto.md`, a partir de [`docs/specs/_template.md`](specs/_template.md).
- Contiene el problema, las historias de usuario y los **criterios de aceptación en formato Dado / Cuando / Entonces**.
- Cada criterio de aceptación tiene que poder convertirse en un test. Si no se puede testear, está mal escrito.
- La spec se mergea antes que el código (o en el mismo PR, como primer commit).

## 2. ADR (Architecture Decision Record)

- Solo cuando hay una decisión difícil de revertir: un proveedor, un patrón, un cambio de esquema importante.
- Archivo: `docs/adr/NNNN-titulo.md`, a partir de [`docs/adr/_template.md`](adr/_template.md).
- Estados posibles: `Propuesto` → `Aceptado` → (`Reemplazado por NNNN`).

## 3. Tests primero (TDD)

| Nivel | Herramienta | Qué cubre | Dónde |
|---|---|---|---|
| Unitario | Vitest | Lógica de dominio pura (`src/domain/`) | `*.test.ts` junto al código |
| Integración | Vitest + Postgres | Server actions y repositorios contra una base real | `*.int.test.ts` (a partir de la primera feature que lo necesite) |
| E2E | Playwright | Criterios de aceptación de la spec, desde el navegador | `e2e/` |
| Evals de IA | Script propio | Calidad de las respuestas del bot en español | `evals/` (ver ADR 0001) |

Ciclo: escribir el test → verlo fallar → implementar lo mínimo → refactor.

## 4. PR y CI

- Una rama por feature: `feat/NNN-nombre`, `fix/...`, `chore/...`.
- Commits con [Conventional Commits](https://www.conventionalcommits.org/es): `feat:`, `fix:`, `chore:`, `test:`, `docs:`.
- El PR usa el template (`.github/pull_request_template.md`) y enlaza la spec.
- El CI (`.github/workflows/ci.yml`) corre lint, typecheck, tests unitarios y build. Los E2E corren cuando están configurados los secrets `E2E_CLERK_*`.
- **No se mergea con CI en rojo.**

## 5. Review

- Revisión con `/code-review` de Claude Code y, si hay otra persona, una revisión humana.
- Para cambios que tocan auth, datos de tenants o claves, también `/security-review`.

## 6. Preview y QA

- Vercel genera un preview deploy por PR, con su propia rama de base de datos (ver ADR 0002).
- Se completa el checklist de QA del PR sobre el preview: flujo feliz, errores, mobile, modo oscuro.

## 7. Merge y deploy

- `develop` → integración continua y preview estable.
- `main` → producción. Las migraciones de Prisma corren en el pipeline de deploy (`prisma migrate deploy`).

## 8. Observabilidad (a partir de la beta)

- Errores con Sentry.
- Costo y latencia por request de IA, con el tier y el modelo usados (ver ADR 0001).
