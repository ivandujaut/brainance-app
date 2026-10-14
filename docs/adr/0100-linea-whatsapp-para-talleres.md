# 0100 — Línea de WhatsApp para talleres, en una rama aparte

- **Estado:** Propuesto
- **Fecha:** 2026-10-09

## Contexto

- **La beta actual** es un chat para el sitio web del negocio. El [posicionamiento](../posicionamiento.md) deja afuera a quien vive de WhatsApp y no tiene web.
- **Los dos primeros clientes reales**, un taller mecánico y un negocio de tortas, son justamente ese caso: todo el negocio pasa por WhatsApp y, como mucho, por Instagram. El taller atiende por WhatsApp, sus clientes llegan solo por recomendación y lo que más le importa es que vuelvan.
- **La idea nueva** es un sistema operativo para esos negocios, empezando por los talleres. La operación diaria pasa por WhatsApp y un panel junta clientes, trabajos y métricas. Los dos se hablan en ambos sentidos: desde WhatsApp el dueño consulta lo que está en el panel y también lo actualiza.
- **La referencia** es [FieldData](https://www.fielddata.ag/), que gestiona campos por WhatsApp: el productor manda mensajes y audios a un número de FieldData, la IA los convierte en registros, el panel web muestra reportes y cada semana llega un resumen por WhatsApp. FieldData empezó solo con ganadería y no se mete entre el productor y sus clientes.
- **Nada de esto está validado.** Hay un solo taller y todavía no hay datos de uso.

## Opciones consideradas

1. **Cambiar el rumbo en `develop`.**
   - *Pro:* hay una sola línea de trabajo.
   - *Contra:* desarma la beta web, que funciona y está publicada, antes de validar lo nuevo.
2. **Un repositorio nuevo.**
   - *Pro:* arranca limpio.
   - *Contra:* se pierde lo que se puede reutilizar (aislamiento por cliente, panel, capa de IA, eval, avisos) y hay que mantener dos infraestructuras.
3. **Una rama principal aparte, `whatsapp-os`, que sale de `develop`.**
   - *Pro:* no se borra nada, lo que sirve se reutiliza donde ya está y las dos líneas se pueden comparar.
   - *Contra:* las líneas se van a separar. Los arreglos de `develop` hay que traerlos con merge, y la base de datos tiene que separarse cuando cambie el esquema.

## Decisión

Se elige la opción 3.

- **El punto de partida.** `whatsapp-os` sale de `develop` en `21728ce` (PR #49). `develop` y `main` siguen con la beta web, sin cambios.
- **El flujo.** El trabajo nuevo va en ramas que salen de `whatsapp-os` y vuelven a `whatsapp-os` por PR, con el mismo proceso de siempre: spec, ADR, TDD, CI y QA ([workflow](../workflow.md)).
- **La numeración.** Para no chocar con `develop`, las specs de esta línea se numeran desde 100 y los ADR desde 0100.
- **Los arreglos compartidos.** Lo que sirve a las dos líneas se arregla en `develop` y se trae a `whatsapp-os` con merge. Nunca al revés, hasta que se decida cuál es la línea principal.
  - El PR #65 (10 de octubre) llevó `whatsapp-os` a `develop` cuando la línea solo tenía documentación, y la rama se borró después del merge. Se recreó en ese mismo punto.
  - Desde entonces, el workflow "Reglas del repo" marca en rojo cualquier PR que lleve commits de `whatsapp-os` a `develop` o a `main` (`scripts/checks/pr-direction.mjs`). Hasta el 14 de octubre no fue un chequeo obligatorio: avisaba, pero no frenaba el merge (ver la nota de ese día).
  - **13 de octubre de 2026:** por decisión del dueño, por ahora todo el trabajo sale de `whatsapp-os`, también lo que serviría a las dos líneas. `develop` y `main` quedan quietas con la beta web. El último merge de `develop` a `whatsapp-os` es el PR #73, que trae los PRs #69 y #70 (íconos en Vercel Blob, ADR 0011). Esto todavía no convierte a `whatsapp-os` en la línea principal: eso sigue esperando a la prueba a mano y a un ADR que reemplace a este.
  - **14 de octubre de 2026:**
    - **Qué pasó.** El PR #80 llevó a `develop` una rama que había salido de `whatsapp-os`, y con ella toda la línea: 15 commits. GitHub había propuesto ese PR con base `develop` porque era la rama por defecto del repo.
    - **Por qué no lo frenó el control.** El PR se mergeó antes de que terminara el chequeo de dirección, que de todos modos no era obligatorio.
    - **El #76.** GitHub lo marcó como mergeado solo, porque sus commits ya estaban en `develop`: era el PR que llevaba `whatsapp-os` a `develop`.
    - **El efecto.** Ninguno en la beta web: la línea solo tenía documentación y herramientas, y las dos ramas quedaron con el mismo contenido. El tag `beta-web` (`b870d23`) marca el último estado de `develop` antes del #80.
    - **Qué cambió desde ese día.**
      - La rama por defecto del repo es `whatsapp-os`.
      - El #81, que repetía el #76, se cerró sin mergear.
      - El ruleset `develop y main` de GitHub exige un PR y los chequeos de dirección, de atribución y de CI antes de mergear en esas ramas. El merge espera a que terminen, y no hay excepciones.
      - El ruleset `whatsapp-os` también exige un PR, el chequeo de atribución y el CI. Antes solo impedía borrar la rama o reescribirla.
    - **Cuándo sí hace falta llevar `whatsapp-os` a `develop`.** Una sola vez, si la línea pasa a ser el producto, con el ADR que reemplace a este. Quizás ni eso, si la línea publica desde su propio proyecto de Vercel (ADR 0102).
- **Qué canal va primero.** Primero el del dueño con el sistema, en un número propio. El de los clientes con el negocio, en el número del taller, queda para cuando el primero esté validado. Un bot que le contesta mal a un cliente que llegó por recomendación puede costarle ese cliente al taller.
- **Antes de escribir código**, se hace la [prueba a mano](../whatsapp-os/prueba-a-mano.md) de dos semanas con el taller.
- **La base de datos.** Cuando esta línea cambie `prisma/schema.prisma`, va a tener su propia rama de Neon y sus propias variables en Vercel, para no romper la base de `develop` ni sus previews.

## Consecuencias

- **Lo que se gana:** explorar sin perder la beta, reutilizar lo hecho ([inventario](../whatsapp-os/inventario.md)) y decidir con datos.
- **Lo que cuesta:** mantener dos líneas, y algún conflicto al traer cambios de `develop`.
- **Lo que sigue:** si la prueba a mano valida, vienen la spec 100 (el canal del dueño) y un ADR para elegir proveedor de WhatsApp (Cloud API directa o un BSP) y de transcripción de audio.
- **Cómo se cierra:**
  - Si la línea avanza, `whatsapp-os` pasa a ser la principal, con un ADR que reemplace a este.
  - Si no avanza, la rama queda archivada y `develop` sigue como está.
