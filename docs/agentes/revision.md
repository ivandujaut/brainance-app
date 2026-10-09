# Guía de revisión

Qué revisar en un diff antes de abrir un PR, o al revisarlo. Sirve para una persona, para cualquier agente y para el subagente `revisor` de Claude Code. Sale de [`AGENTS.md`](../../AGENTS.md) y de los `AGENTS.md` de cada área. Si una regla cambia allá, se actualiza acá.

Cada hallazgo se reporta con:

- el archivo y la línea;
- qué regla rompe;
- qué podría salir mal, en concreto;
- qué hacer.

Primero lo que bloquea; después, lo opcional.

## Bloquea el merge

- **Aislamiento entre clientes:** una acción que recibe un id del navegador y no lo resuelve con `findOwnedSite` o `findOwnedChatRoom`, o que opera sobre el id original. También bloquea que falte su caso en `src/actions/tenant-isolation.int.test.ts`.
- **Secretos:**
  - claves, tokens o URLs con credenciales en el diff;
  - una variable nueva sin documentar en `.env.example`;
  - algo secreto en `NEXT_PUBLIC_*`.
- **Datos de conversaciones en Sentry o en logs:** texto de un visitante, emails o respuestas de calificación que lleguen a `captureError`, `console.*` o a un servicio externo.
- **Prompt injection:** el modelo recibe permisos o datos que el visitante no debería poder pedir.
- **Esquema sin migración**, o un `db push` en una base compartida.
- **Prompt o modelo de IA cambiado sin eval.**
- **Atribución a una IA** en commits o en la descripción del PR.
- **Código nuevo sin tests,** o tests que no fallarían si el código estuviera mal.

## Conviene arreglar

- **`src/domain/` importa** Next, Prisma, Clerk o un SDK de IA.
- **Una acción decide reglas de negocio** que deberían estar en `src/domain/`.
- **Errores con `console.error`** en lugar de `captureError` o `captureWarning`.
- **UI:**
  - hex sueltos o colores arbitrarios en lugar de tokens;
  - componentes nuevos que hacen fetch en `useEffect` en lugar de leer en un Server Component;
  - otra tipografía, o tema oscuro.
- **Textos:** documentación que no está en español, o código y comentarios que no están en inglés.
- **Documentación desactualizada:** una spec o un ADR que el cambio contradice, o algo aprendido que debería quedar en `AGENTS.md`.

## No es un hallazgo

- **Estilo** que ya resuelven ESLint y el typecheck.
- **Preferencias** sin un riesgo concreto. Si vale la pena, se menciona como opcional.
