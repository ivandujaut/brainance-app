# 100 — El canal del dueño: el taller por WhatsApp

- **Estado:** Borrador anticipado. Se escribe mientras corre la [segunda etapa de la prueba a mano](../whatsapp-os/prueba-a-mano-segunda-etapa.md), para arrancar apenas termine. No se implementa hasta que la prueba valide y el dueño la apruebe. Los puntos marcados **(condicional)** dependen de sus resultados.
- **ADRs relacionados:**
  - [0100](../adr/0100-linea-whatsapp-para-talleres.md): la línea.
  - [0101](../adr/0101-proveedor-de-whatsapp.md): Cloud API directa en la fase 1 y transcripción.
  - [0102](../adr/0102-arquitectura-de-la-linea-whatsapp.md): la IA propone, el dominio valida y el dueño confirma.
  - [0004](../adr/0004-aislamiento-multi-tenant.md): cada taller ve solo lo suyo.
  - [0011](../adr/0011-iconos-en-vercel-blob.md): Vercel Blob, acá con archivos privados.
- **Base:** [resultados de la primera etapa](../whatsapp-os/prueba-a-mano-resultados.md) y los primeros días de la segunda (ver "Lo que ya se sabe").

## Problema

El dueño de un taller chico lleva el taller en la cabeza y en sus chats. No anota, porque cargar datos es otra tarea, y por eso no sabe a qué clientes les toca volver. Y lo que más le preocupa es que le entre trabajo: "a veces la gente se olvida de que uno está".

## Lo que ya se sabe

Lo que se vio en la prueba a mano con el primer taller, y que esta spec convierte en requisitos:

- **Cuenta como le sale, a la noche y en tanda.** Audios largos y ordenados, como una bitácora: entrada, diagnóstico, repuestos, mano de obra, pago, entrega. Usa fechas relativas ("el viernes") y cuenta cosas que ya pasaron.
- **Identifica los autos con una foto y a los clientes con una tarjeta de contacto.** La patente casi nunca está en el audio: está en la foto.
- **Avisa cuando entra un auto, pero no cuando sale.** Las cuatro entregas de la segunda etapa las contó recién en respuesta al resumen de la mañana. Sin el resumen, el registro se llena de autos que ya no están.
- **Sin confirmación, repite.** Volvió a grabar audios porque no supo si habían llegado.
- **Una pregunta corta se contesta enseguida;** la hoja en blanco, no. El resumen de las 8 lo contestó en 5 minutos.
- **Si le explicás para qué, da el dato:** "¿Me pasás el contacto? Así te aviso cuando le toque el service" se contestó en 17 minutos.
- **La demora del sistema pesa:** un día, la respuesta tardó 10 horas y el dueño se quedó sin confirmación. Una persona no sostiene "contesto en minutos" todo el día; el sistema sí.
- **No todo pide respuesta:** "Hola" y "Ok" no se contestan.

## Historias de usuario

- Como **dueño del taller**, quiero contar lo que pasa como me sale (audio, foto, texto o un contacto) para que quede anotado sin llenar nada.
- Como **dueño**, quiero recibir cada mañana cómo está el taller y qué quedó pendiente, para no tener que acordarme.
- Como **dueño**, quiero preguntar "¿qué tengo para entregar?" y que me contesten con lo anotado, sin inventar.
- Como **dueño**, quiero saber a qué clientes les toca volver, para conseguir trabajo.
- Como **dueño**, quiero corregir en una línea ("no, era el Corsa") sin entrar a ningún lado.
- Como **dueño**, quiero ver en el panel mis autos, mis clientes y de qué mensaje salió cada dato.

## Criterios de aceptación

### Alta y vínculo

1. **Dado** un taller dado de alta con un código, **cuando** el dueño lo manda por WhatsApp, **entonces** queda vinculado por su BSUID (no por su número) y recibe "Listo, ya podés contarme lo que pase en el taller".
2. **Dado** un remitente no vinculado, **cuando** escribe, **entonces** recibe una respuesta fija, no accede a ningún dato y no se procesa con IA.

### Recepción

3. **Dado** un evento con la firma `X-Hub-Signature-256` inválida, **cuando** llega al webhook, **entonces** responde 401 y no guarda nada.
4. **Dado** el mismo `wamid` dos veces, **cuando** llegan casi juntos, **entonces** se guarda una sola vez (índice único) y los dos reciben 200.
5. **Dado** un evento válido, **cuando** llega, **entonces** el webhook guarda el crudo y responde 200 antes de bajar archivos o llamar a la IA.

### La tanda y la confirmación

6. **Dado** que el dueño manda varios mensajes seguidos, **cuando** pasan **T** minutos sin un mensaje nuevo, **entonces** la tanda se cierra y recibe **una sola** respuesta. T se define con los datos de la prueba (ver "Preguntas abiertas").
7. **Dado** una tanda con algo para anotar, **cuando** se procesa, **entonces** la respuesta empieza con "Anotado:" y dice qué quedó anotado, en una línea por auto.
8. **Dado** una tanda sin nada para anotar ("Hola", "Ok", un saludo), **cuando** se cierra, **entonces** no se responde.
9. **Dado** que falta un dato que se va a necesitar (de quién es el auto), **cuando** se confirma, **entonces** la confirmación termina con **una sola** pregunta. Nunca más de una por mensaje.

### La carga

10. **Dado** un audio que cuenta un trabajo, **cuando** se procesa, **entonces** se crea o actualiza el trabajo con lo que diga (auto, cliente, problema, diagnóstico, repuestos y quién los compra, mano de obra, forma de pago, estado, fechas), y cada dato apunta al mensaje del que salió.
11. **Dado** una fecha relativa ("el viernes", "ayer", "esta mañana"), **cuando** se anota, **entonces** se guarda la fecha real según el día del mensaje y la zona horaria del taller.
12. **Dado** una foto de un auto con la patente a la vista, **cuando** se procesa, **entonces** la patente queda en el auto. Si es un auto nuevo, se abre un trabajo y la confirmación pregunta qué tiene.
13. **Dado** una tarjeta de contacto, **cuando** se procesa, **entonces** el cliente queda con su nombre y su teléfono, y se asocia al auto del que se está hablando.
14. **Dado** el mismo trabajo contado dos veces (un reenvío con otras palabras), **cuando** se procesa, **entonces** se completa el trabajo que ya existe, no se abre otro.
15. **Dado** que no está claro de qué auto habla ("el Gol", con dos Gol abiertos), **cuando** se procesa, **entonces** no se adivina: la confirmación pregunta "¿Cuál Gol?".
16. **Dado** un plazo en lo que cuenta ("mañana busca los repuestos", "sale esta semana", "vuelve a fin de mes"), **cuando** se anota, **entonces** queda un **pendiente** con su fecha.
17. **Dado** que el dueño corrige ("no, era el Corsa"), **cuando** se procesa, **entonces** el registro se edita y guarda el historial del cambio.

### El resumen de la mañana

18. **Dado** un día hábil con autos en el taller, **cuando** son las 8 en la zona horaria del taller, **entonces** el dueño recibe el resumen:
    - los autos en el taller, con su estado;
    - lo entregado el día anterior;
    - los pendientes vencidos, marcados "sin confirmar";
    - **una sola** pregunta, sobre el pendiente vencido más antiguo.
19. **Dado** un pendiente vencido que ya se preguntó y no se contestó, **cuando** sale el resumen siguiente, **entonces** se sigue mostrando como "sin confirmar", pero no se vuelve a preguntar dos días seguidos.
20. **Dado** un día sin autos en el taller y sin pendientes, **cuando** son las 8, **entonces** no se manda resumen.
21. **Dado** que el dueño escribió en las últimas 24 horas, **cuando** sale el resumen, **entonces** va como texto libre. Si no, va como plantilla utility aprobada (ADR 0101).

### Consultas

22. **Dado** una consulta ("¿qué tengo para entregar?", "¿cuánto cobré esta semana?", "¿qué le hice al Gol?"), **cuando** se procesa, **entonces** se contesta solo con lo anotado, con herramientas de solo lectura.
23. **Dado** una consulta sobre algo que no está anotado, **cuando** se procesa, **entonces** la respuesta lo dice ("Eso no lo tengo anotado") y no inventa.

### Que vuelvan los clientes

24. **Dado** un cliente que quedó en volver ("a fin de mes"), **cuando** pasa la fecha sin novedades, **entonces** el resumen lo muestra en "Para que vuelvan".
25. **Dado** un service con kilómetros o fecha, **cuando** se anota, **entonces** queda la fecha del próximo service según la regla del taller, y el resumen lo muestra la semana en que vence.
26. **(condicional)** **Dado** clientes con service vencido o un auto listo, **cuando** el dueño lo pide o una vez por semana, **entonces** el sistema le arma un mensaje para sus clientes **que manda él**. El sistema nunca les escribe a los clientes del taller.

### Lo que depende de la segunda etapa

27. **(condicional)** **Dado** un día hábil en que el dueño no mandó nada, **cuando** son las 20, **entonces** recibe una sola pregunta: sobre un trabajo abierto, o "¿Entró algún auto hoy? Con una foto alcanza". Entra si la segunda etapa muestra que arma el hábito y no solo lo reemplaza.
28. **(condicional)** **Dado** un viernes, **cuando** sale el resumen, **entonces** suma los números de la semana: autos, entregados y mano de obra cobrada.

### Panel

29. **Dado** el dueño en el panel, **cuando** entra, **entonces** ve sus trabajos (en curso y entregados) y sus clientes, y en cada dato, el mensaje del que salió.
30. **Dado** otro taller, **cuando** intenta ver un trabajo ajeno por id, **entonces** no ve nada (ADR 0004).

### Privacidad

31. **Dado** un audio crudo con más de 30 días, **cuando** corre la limpieza, **entonces** se borra el archivo y queda la transcripción (ADR 0102).
32. **Dado** un error que llega a Sentry, **cuando** contiene una patente o un teléfono, **entonces** el filtro de `src/lib/sentry-scrub.ts` lo tapa.

## Fuera de alcance

- **Escribirles a los clientes del taller.** Es la fase 2, con coexistencia (ADR 0101). Acá el sistema le arma el mensaje y lo manda el dueño.
- **Facturación electrónica, inventario de repuestos, turnos, varios usuarios por taller e Instagram** ([README de la línea](../whatsapp-os/README.md)).
- **Formularios, botones o menús de WhatsApp.** El dueño cuenta como le sale (ADR 0102, opción 2).
- **Cobrarle al taller.** El precio sale de la charla de cierre de la prueba.
- **Otros rubros.** Los datos son de taller mecánico; el negocio de tortas tiene su propio modelo.
- **Leerle al dueño la conversación con sus clientes.** Solo entra lo que él manda al número del sistema.

## Notas técnicas

### Modelo de datos (propuesta)

En la rama de Neon propia de la línea (ADR 0100), con migración:

| Modelo | Qué guarda |
|---|---|
| `Workshop` | El taller: BSUID del dueño, número (si viene), zona horaria, código de alta, regla de service |
| `Client` | Nombre, teléfono, de qué tarjeta de contacto o mensaje salió |
| `Vehicle` | Modelo, patente (puede faltar), cliente |
| `Job` | El trabajo: problema, diagnóstico, estado, fechas de entrada y entrega, presupuesto, repuestos (monto y quién los compra), mano de obra, cobrado y forma de pago |
| `FollowUp` | Un pendiente con fecha: repuestos a buscar, auto frenado, cliente que vuelve, próximo service. Lo usa el resumen |
| `InboundMessage` | El evento crudo (`wamid` único), el tipo, el media ID, el archivo en Blob privado, la transcripción y la tanda |
| `OutboundMessage` | Lo que mandó el sistema: tipo (confirmación, resumen, pregunta, respuesta), texto o plantilla y si cayó en la ventana de 24 horas |
| `Operation` | Cada cambio que propuso la IA, con clave única (`wamid` y número de operación), el dato anterior y el nuevo: el historial y la idempotencia (ADR 0102, regla 7) |

Los estados del trabajo son los de la planilla de la prueba: esperando aprobación, en reparación, esperando repuesto, listo para entregar y entregado.

### Piezas

- **`src/server/whatsapp/`:** el adaptador de la Cloud API (enviar y bajar archivos con el media ID), detrás de una interfaz.
- **`src/server/transcription/`:** voz a texto con el vocabulario del taller (sus clientes, sus modelos y la jerga), detrás de una interfaz. Lo elige el eval del ADR 0101.
- **Extracción:** un modelo con salida estructurada que propone operaciones. El dominio (`src/domain/workshop/`) las valida, resuelve a qué auto y cliente se refieren y decide si hace falta una pregunta.
- **Orquestación:** Vercel Workflow, con pasos idempotentes (ADR 0102, regla 3). La tanda es un paso que espera T minutos.
- **Resumen:** tarea programada por taller, a las 8 de su zona horaria. Necesita Vercel Pro (ADR 0102).

### Costos

- **Mensajes de Meta:** una respuesta por tanda, más el resumen. El resumen de las 8 suele caer en la ventana de 24 horas, porque el dueño cuenta a la noche. La pregunta de la noche **(condicional)** cae afuera y lleva plantilla.
- **IA:** transcripción, extracción y, a veces, una foto, con el tope de gasto del proyecto de la línea (ADR 0102).

### Riesgos

- **La transcripción falla justo en lo importante:** modelos de auto, jerga ("mano de obra" sale "maniobra") y apellidos. Se mitiga con el vocabulario del taller y con la confirmación, que deja ver el error al dueño.
- **El registro se desactualiza** si el dueño no avisa las entregas. El resumen con pendientes vencidos es el mecanismo para corregirlo, no un extra.
- **Que parezca un asistente de uso general** (cláusula "AI Providers", ADR 0101): el bot solo habla del taller y el panel es el sistema de registro.

## Preguntas abiertas

Se cierran con los resultados de la segunda etapa:

1. **Cuánto dura una tanda (T).** En la prueba, las tandas de la mañana tuvieron menos de 1 minuto entre mensajes; las de la noche, hasta 7. Propuesta inicial: 3 minutos, medida con los chats de la prueba.
2. **La pregunta de la noche** (criterio 27): ¿arma el hábito o lo reemplaza?
3. **El mensaje para sus clientes** (criterio 26): ¿lo usa?
4. **La regla de service por defecto:** kilómetros y meses. Se le pregunta al dueño en el alta, o se toma la de su último service.
5. **Fotos o audios como camino principal** (ADR 0102, punto abierto 1).
6. **Qué ve el dueño si la IA no está disponible** (ADR 0102, punto abierto 2).
7. **El precio,** de la charla de cierre.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 1, 2 | Integración | `src/server/whatsapp/link.int.test.ts` |
| 3, 4, 5 | Integración | `src/app/api/whatsapp/webhook/route.int.test.ts` |
| 6, 8 | Unitario | `src/domain/workshop/batch.test.ts` |
| 7, 9, 15 | Unitario | `src/domain/workshop/confirmation.test.ts` |
| 10, 13, 14, 16, 17 | Unitario (dominio) y eval de extracción | `src/domain/workshop/operations.test.ts`, `evals/whatsapp-extraccion/` |
| 11 | Unitario | `src/domain/workshop/dates.test.ts` |
| 12 | Eval de fotos | `evals/whatsapp-fotos/` |
| 18, 19, 20, 24, 25, 28 | Unitario | `src/domain/workshop/morning-summary.test.ts` |
| 21 | Unitario | `src/domain/workshop/window.test.ts` |
| 22, 23 | Eval de consultas | `evals/whatsapp-consultas/` |
| 26, 27 | Unitario | `src/domain/workshop/nudges.test.ts` |
| 29 | E2E | `e2e/workshop-panel.spec.ts` |
| 30 | Integración | `src/actions/tenant-isolation.int.test.ts` |
| 31 | Integración | `src/server/workshop/retention.int.test.ts` |
| 32 | Unitario | `src/lib/sentry-scrub.test.ts` |

Los casos de los evals salen de los mensajes reales de la prueba a mano, anonimizados y con el consentimiento del dueño.
