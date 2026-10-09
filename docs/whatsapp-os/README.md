# Línea WhatsApp: sistema operativo para talleres

Esta carpeta junta todo lo de la línea `whatsapp-os` ([ADR 0100](../adr/0100-linea-whatsapp-para-talleres.md)). Son hipótesis, no un posicionamiento. Cuando la [prueba a mano](prueba-a-mano.md) dé resultados, este texto pasa a ser el posicionamiento de la línea.

## Para quién

El dueño de un taller mecánico chico que maneja todo por WhatsApp: los clientes, los presupuestos, los avisos de "ya está tu auto". Sus clientes llegan por recomendación, y lo que más le importa es que vuelvan. Trabaja con las manos ocupadas y, si tiene web, casi no la usa.

Después, otros negocios que viven en WhatsApp, como el de tortas. Cada rubro tiene su propio modelo de datos, así que se suman de a uno.

## Hipótesis del problema (a confirmar con la prueba)

- Lo que pasa en el taller está en la cabeza del dueño y en sus chats: qué autos hay, qué tiene cada uno, qué presupuesto pasó, quién aprobó, quién debe.
- No lleva una planilla ni usa un software de taller, porque cargar datos es otra tarea más.
- No sabe cuánto factura por mes ni cuándo le toca el service a cada cliente. Por eso pierde la oportunidad de que vuelvan.
- Contestarles a los clientes le lleva tiempo, pero puede que no sea lo que más le duele. La prueba lo va a decir.

## La idea

| Canal | Qué pasa | Cuándo |
|---|---|---|
| **El dueño con el sistema** | El dueño le cuenta al sistema lo que pasa, por audio o texto, en un número nuestro: "Entró el Gol de Pérez, AB123CD, hace ruido el tren delantero". El sistema lo carga y confirma. El dueño también le pregunta cosas ("¿qué autos entrego hoy?") y cada mañana recibe un resumen | Primero |
| **El panel** | Clientes, autos, trabajos, plata y métricas en un solo lugar, con lo mismo que entra por WhatsApp | Junto con el primero |
| **Los clientes con el negocio** | El bot contesta en el número del taller, con datos del sistema ("tu auto está listo, se retira hasta las 18") y derivando lo demás al dueño | Después de validar el primero |

Cada dato guarda el mensaje del que salió. Si el sistema no entiende algo, pregunta en lugar de inventar.

## Lo que no hace, por ahora

Facturación electrónica, inventario de repuestos, turnos, varios usuarios por taller ni Instagram. Se suman solo si la prueba o los clientes los piden.

## Preguntas abiertas

- ¿Qué le duele más al dueño: contestarles a los clientes o tener el taller bajo control?
- ¿Manda los datos sin que nadie se lo pida? ¿Por audio o por texto?
- ¿Cuánto pagaría por mes?
- ¿Cómo se llama el producto? La [investigación de nombres](../mercado/reports/Nombres%20y%20dominio%20para%20BrAInance.md) se hizo para la beta web. El nombre nuevo conviene sacarlo del vocabulario del taller ([guion](../mercado/guion-prueba-de-nombre.md)).

## Documentos

- [Prueba a mano](prueba-a-mano.md): dos semanas con el taller, sin código.
- [Inventario](inventario.md): qué se reutiliza de la beta web y qué hay que construir.
