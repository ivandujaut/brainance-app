# Prueba a mano: el taller por WhatsApp, sin código

Dos semanas en las que el sistema sos vos con una planilla. Lo más riesgoso de la idea no es técnico: es si el dueño va a contarle al sistema lo que pasa en el taller. Eso se prueba antes de escribir una línea de código.

## Qué queremos saber

1. **Hábito:** ¿el dueño manda lo que pasa en el taller sin que se lo pidan, todos los días?
2. **Valor:** ¿qué usa? ¿El resumen de la mañana, las consultas, los recordatorios de service?
3. **Lenguaje y datos:** ¿cómo lo cuenta (audio o texto, con qué palabras) y qué datos aparecen (cliente, auto, patente, trabajo, presupuesto, cobro, repuestos, kilómetros)?
4. **Dolor principal:** ¿le pesa más contestarles a sus clientes o tener el taller bajo control?

## Cómo funciona

- **El número:** un WhatsApp Business aparte, ni el del taller ni tu número personal, con un nombre de perfil neutro.
- **Duración:** 10 días hábiles.
- **Lo que hace el dueño:** manda audios, fotos o textos cuando pasa algo: entra un auto, pasa un presupuesto, el cliente aprueba, falta un repuesto, se termina un trabajo, se cobra.
- **Lo que hacés vos:**
  - Cargás cada mensaje en la planilla dentro de la hora, en un horario que le avisás (por ejemplo, de 8 a 20).
  - Confirmás con un mensaje corto: "Anotado: Gol AB123CD de Pérez, tren delantero."
  - Si falta un dato, preguntás uno solo: "¿De quién es el Gol?". Nunca lo completás vos.
  - Contestás sus consultas ("¿qué autos entrego hoy?") solo con lo que está en la planilla. Si no está, se lo decís.
  - Le mandás el resumen todos los días a las 8.
- **Nunca le escribís a los clientes del taller.**
- **Dos charlas de 10 minutos**, el día 3 y el día 10.

## Qué le decís al dueño

> "Durante dos semanas, contale a este número lo que pasa en el taller, como se lo contarías a un empleado: audios, fotos, lo que te salga. Yo lo anoto y cada mañana te mando cómo está todo. Le podés preguntar lo que quieras del taller. Es gratis; lo que me importa es saber si te sirve."

**Privacidad:** los nombres, teléfonos y patentes de sus clientes son datos personales. Pedile por escrito, en el mismo chat, que acepte que los anotes solo para la prueba. Guardalos en una planilla privada, no se los pases a nadie y borralos al terminar si él lo pide.

## La planilla

Tres pestañas:

| Pestaña | Una fila por | Columnas |
|---|---|---|
| **Mensajes** | Cada mensaje del dueño | Fecha y hora; audio (con duración) o texto; qué buscaba (cargar, consultar, otra cosa); si lo mandó él o contestaba algo tuyo; si se entendió a la primera; cuánto tardaste en contestar; resumen o transcripción |
| **Trabajos** | Cada auto | Patente; auto; cliente; teléfono; qué tiene; presupuesto; si se aprobó; estado; fecha de entrada; fecha de entrega; si se cobró y cuánto; kilómetros; próximo service |
| **Consultas** | Cada pregunta del dueño | La pregunta textual; si se pudo contestar con la planilla; qué faltaba |

## El resumen de la mañana (modelo)

> Buen día. Hoy hay 4 autos en el taller.
> - **Para entregar:** Hilux de Gómez (service). Falta cobrar $180.000.
> - **Esperando repuesto:** Gol de Pérez (embrague), desde el martes.
> - **Esperando aprobación:** Corsa de Díaz, presupuesto de $350.000 enviado hace 3 días.
>
> Ayer entraron 2 y se entregó 1.

Al final de la segunda semana, sumale una línea con los clientes a los que les tocaría el service, si aparecieron los datos.

## Qué medir y cuándo vale

La semana 2 pesa más que la 1, porque al principio todo es novedad.

| Señal | Valida | No valida |
|---|---|---|
| Mensajes por día hábil en la semana 2 | 5 o más | Menos de 2 |
| Días con al menos un mensaje, de 10 | 8 o más | 5 o menos |
| Mensajes que manda él sin que se los pidas | La mayoría | Casi todos necesitan un empujón |
| Consultas al sistema en la semana 2 | Al menos una por día | Ninguna |
| La charla del día 10 | Pregunta si sigue, o pide algo más | "Me olvidaba", "es una cosa más para hacer" |
| Precio | Dice una cifra y acepta seguir pagando | "Si es gratis, sí" |

## Qué sale de la prueba

- **Si valida:**
  - **La spec 100**, el canal del dueño, con lo aprendido: qué datos, qué consultas, qué resumen y qué palabras usa.
  - **Un ADR** para elegir proveedor de WhatsApp y de transcripción de audio.
  - **Los casos del eval**, sacados de los mensajes reales y anonimizados.
- **Si no valida:**
  - Antes de descartar, entender por qué: ¿no le entra en el día, o el problema era otro?
  - La misma prueba con el negocio de tortas sirve para comparar.
