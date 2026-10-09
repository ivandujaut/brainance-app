# 0101 — Proveedor de WhatsApp y transcripción de audios

- **Estado:** Propuesto. Pasa a Aceptado si la [prueba a mano](../whatsapp-os/prueba-a-mano.md) valida y se confirman los datos de "Antes de aceptar".
- **Fecha:** 2026-10-09
- **Base:** [informe "Conexión de WhatsApp para talleres"](../mercado/reports/Conexi%C3%B3n%20de%20WhatsApp%20para%20talleres.md) y sus seis notas.

## Contexto

La línea `whatsapp-os` ([ADR 0100](0100-linea-whatsapp-para-talleres.md)) tiene dos fases:

- **Fase 1:** el dueño del taller le habla (audios, texto, fotos) a un número propio de la startup. El sistema registra, responde consultas y manda un resumen diario.
- **Fase 2:** un bot atiende en el número del propio taller, en coexistencia con la app WhatsApp Business, que el dueño sigue usando.

Hechos que pesan en la decisión (los marcados con * todavía hay que confirmarlos en la fuente oficial):

- **Desde el 1 de octubre de 2026, Meta cobra las respuestas dentro de la ventana de 24 h.** Las paga como utility: unos USD 0,026 por mensaje en Argentina (ARS 37,68)*. Cada número trae 1.000 mensajes de servicio gratis por mes*. En la fase 1 todos los talleres comparten ese cupo, así que el costo de Meta va de USD 0,81 por taller y por mes (hasta 4 talleres) a USD 6,01 (50 talleres), a precio de lista y sin impuestos.
- **La coexistencia (fase 2) solo se puede hacer con Embedded Signup v4,** operado por un Tech Provider o un BSP. Un número en coexistencia no se migra entre proveedores: cambiar de proveedor obliga a cada taller a repetir el alta.
- **La cláusula "AI Providers"** de los términos de Meta (vigente desde el 15 de enero de 2026) prohíbe los asistentes de IA de uso general. La fase 2 es el caso que Meta declaró permitido. La fase 1 queda en zona gris. Argentina no tiene la protección regulatoria que lograron Italia, Brasil y la UE.
- **Meta prohíbe entrenar modelos con los datos que pasan por WhatsApp.**
- **Nadie publica mediciones de transcripción en rioplatense.** El costo no decide: transcribir cuesta menos de USD 1 por taller y por mes con cualquier opción seria.

## Opciones consideradas

**Fase 1**

1. **Cloud API directa.** Sin cuota de plataforma, sin App Review, factura en pesos y el número se puede migrar después. El soporte es solo el formulario general.
2. **BSP con cuota por número** (360dialog, Kapso, YCloud). No agrega nada que haga falta para un número propio, y suma una cuota.
3. **BSP con recargo por mensaje** (Twilio, Gupshup). Cobra también los audios que llegan.

**Fase 2**

1. **BSP con alta alojada** (Kapso o 360dialog). Permite pilotear la coexistencia sin escribir Embedded Signup propio. Ata cada taller a ese BSP.
2. **Tech Provider propio.** Es gratis, pero exige verificar el negocio y pasar la App Review (dos videos). No da línea de crédito: cada taller le paga a Meta con su tarjeta.
3. **Solution Partner que comparta su crédito.** La startup factura todo, a cambio de depender de ese partner.

## Decisión (propuesta)

**Fase 1: Cloud API directa, con un número propio nuevo** (SIM prepaga que nunca estuvo en WhatsApp).

- **Mensajes:** un mensaje saliente por cada mensaje del dueño, sin un "anotado" aparte. Es la variable que más mueve el costo y va como requisito de la spec 100.
- **Webhook:**
  - verifica la firma (`X-Hub-Signature-256`), deduplica por `wamid` y responde 200 enseguida;
  - la descarga y la transcripción van en `after()`, con una tabla de trabajos y un cron que reintenta;
  - el audio se copia a almacenamiento propio, porque la URL de Meta dura 5 minutos y el media ID, 7 días.
- **Resumen diario:** como texto libre mientras la ventana esté abierta y quede cupo. Si no, como plantilla utility.
- **Transcripción:** la decide un eval con 50 a 100 audios reales de la prueba a mano, que mide si salen bien la patente, el modelo, el repuesto y el monto. Arranca por los modelos que ya ofrece el AI Gateway, sin dependencias nuevas, y solo con proveedores que no entrenen con los datos.
- **Barandas por la cláusula de IA:** un bot acotado al taller, el panel web como sistema de registro, un camino a una persona y el producto presentado como software de gestión. WhatsApp es un canal: si Meta lo cierra, el producto sigue.

**Fase 2: piloto con el alta alojada de un BSP** (Kapso, o 360dialog como alternativa) con uno a tres talleres. En paralelo, con el negocio ya verificado, se tramita el alta como Tech Provider. Se decide con los datos del piloto.

**Lo que no se revierte** se decide con nombre propio antes de empezar:

- **El titular del portfolio de Meta:** la SAS, si se constituye en los próximos meses; si no, el monotributo.
- **La moneda de la cuenta (WABA):** pesos, si Meta acepta la tarjeta argentina.
- **El primer proveedor de coexistencia de cada taller.**

## Antes de aceptar

Hay que confirmar en la fuente oficial lo que el informe leyó a través de fragmentos de buscador:

- las tarifas de Argentina en el archivo de precios de Meta;
- el cupo de 1.000 mensajes de servicio, y si se cuenta por número, por cuenta o por portfolio;
- qué pasa si no hay medio de pago desde el 1 de octubre;
- si la coexistencia funciona para números +54;
- los parámetros de Embedded Signup v4;
- el texto vigente de la cláusula "AI Providers";
- el formato real del webhook de un audio. Se confirma con el número de prueba de Meta.

## Consecuencias

- **Lo que se gana:** la fase 1 arranca sin intermediarios ni cuotas, con la única opción que factura en pesos, y no cierra el camino a un BSP.
- **Lo que cuesta:**
  - **WhatsApp:** unos USD 1 a 7 por taller y por mes en la fase 1, más impuestos. Con monotributo, el costo final es 1,23 veces eso, y el pago con tarjeta adelanta hasta 1,53 veces.
  - **Transcripción:** menos de USD 1 por taller y por mes.
- **Riesgos:**
  - Que Meta clasifique la fase 1 como "AI Provider".
  - La volatilidad de la plataforma: hubo seis cambios importantes entre 2025 y 2026.
  - Un solo número concentra el riesgo de bloqueo de todos los talleres.
- **Qué sigue:** si la prueba a mano valida, se confirman los datos de "Antes de aceptar", el ADR pasa a Aceptado y se escribe la spec 100 del canal del dueño.
