# Refutación del hueco "handoff para una persona sin turno fijo" (lente: competidores globales con soporte en español y planes de entrada)

- Fecha: 2026-10-07
- Rol del agente: escéptico. Objetivo: refutar con evidencia verificada en vivo la afirmación de que ningún competidor global (Tidio, Intercom, Chatbase, Crisp, etc.) cubre este hueco de forma accesible para un negocio de una persona en Argentina.
- Búsquedas realizadas: 8 (WebSearch). Los sitios de los proveedores están bloqueados por el proxy; la evidencia sale de fragmentos de búsqueda y de páginas de terceros (centros de ayuda indexados, comparativas de precios, reseñas en Shopify/Capterra/G2, blogs).
- Veredicto: **NO refutado** (`refuted=false`, `verified_live=true`), pero con un matiz grande: **Tidio ya tiene el mecanismo completo** (handoff configurable, app móvil, notificaciones por email/push, toma de control). Lo que no cubre es la confiabilidad del aviso, el precio para un negocio chico argentino y la simplicidad de "una sola lista". El hueco es más chico de lo que dice la afirmación original.

## El hueco bajo examen

> Handoff para UNA persona sin turno fijo: aviso confiable al dueño cuando el bot se traba o el visitante pide una persona, y toma de control en dos toques desde el celular, sin inbox multiagente ni helpdesk de terceros.

Para marcarlo como refutado hacía falta un contraejemplo concreto: producto + URL que, para un negocio de una persona en Argentina, (a) avise al dueño de forma confiable cuando el bot deriva, (b) permita tomar la conversación desde el celular, (c) no exija un equipo ni un helpdesk aparte y (d) sea accesible al precio de un micro-negocio (la beta de BrAInance es gratis; el punto de comparación razonable es un plan gratuito o de pocos dólares). Ningún candidato cumple las cuatro. Tidio cumple (b) y (c) y cumple (a) y (d) a medias.

## Candidatos encontrados y por qué no refutan

| Producto | Qué cubre del hueco | Qué no cubre | Fuente |
|---|---|---|---|
| **Tidio (Lyro)** — el candidato más cercano | Lyro tiene una pestaña *Configure > Conversation handoff* con dos comportamientos separados: uno para cuando el operador está online y otro para horario offline; el default de ambos es "Transfer conversation to operator", y la alternativa es crear un ticket y avisar al visitante que le responderán por email. Lyro detecta frustración o un pedido que no puede resolver y dispara una notificación al equipo. Las notificaciones llegan por navegador, por email ("si está configurado") y por la app móvil ("si está instalada"). Hay app iOS/Android y el operador responde desde ahí. Plan gratuito: 50 conversaciones/mes de chat humano y 50 conversaciones de IA en total (no por mes). Es decir: el mecanismo que BrAInance propone ya existe, con más opciones (ticket, horario). | **Confiabilidad del aviso**: el pedido literal "notify via email faster when the bot gets stuck or if the user asks to speak to a human" sigue abierto en las reseñas de Shopify; Tidio respondió describiendo la función, no un cambio. El email es opcional ("if configured") y las reseñas de 1 estrella citadas en la evidencia a favor ("missed every single chat", "not getting email notifications") muestran que el aviso no es el eje del producto. **Precio**: la IA se agota a las 50 conversaciones y después Lyro cuesta USD 39/mes (USD 32,50 anual) por 50 conversaciones de IA, escalando a USD 79–149 por 500–1.000; son tres medidores paralelos (conversaciones humanas, conversaciones de Lyro, visitantes de Flows), en dólares y sin precio en pesos. **Forma**: es un inbox multi-operador con tickets, flows y email marketing; "una sola lista, tomás y devolvés" no es su propuesta. **Idioma**: la búsqueda no devolvió nada sobre panel en español ni voseo (de memoria, Tidio tiene UI en español neutro; no se verificó). | https://help.tidio.com/hc/en-us/articles/14667264947356-How-do-flows-Lyro-and-live-agents-work-together · https://help.tidio.com/hc/en-us/articles/9003475527196-Lyro-the-conversational-AI-chatbot · https://apps.shopify.com/reviews/1911516 · https://aiproductivity.ai/guides/tidio-shopify-setup-guide/ · https://eesel.ai/blog/tidio-pricing · https://chatarmin.com/en/blog/tidio-pricing · https://www.hackceleration.com/labs/tidio-pricing |
| **Crisp** | Plan Free permanente con 2 asientos, apps iOS/Android y push "cada vez que entra un mensaje nuevo". Publicita "AI bots to human handover when AI falls short" y se dirige a "small and mid-sized businesses". | Los workflows de IA y la automatización **no están en el plan Free**: arrancan en Essentials (USD 95/mes por workspace según la comparativa de precios citada en el informe de precio plano). Sin IA no hay "el negocio responde a las 3 de la mañana"; con IA, el precio está fuera de escala para una panadería. La IA se mide aparte con créditos. | https://help.crisp.chat/en/article/getting-started-with-the-free-plan-1rjhsh5 · https://fritz.ai/crisp-ai-review/ · https://apps.shopify.com/app10199 |
| **Chatbase** | Acción "Live Chat": el agente deriva al Help Desk de Chatbase, la conversación queda etiquetada como "Live chat session" y "los agentes son notificados inmediatamente". Help Desk propio desde mayo de 2026 (bandeja unificada, asignación, toma de control). Reglas de escalación en lenguaje natural. | El Help Desk (y por lo tanto la toma de control en vivo) es del plan **Standard, USD 150/mes**; Hobby (USD 40/mes, 700 créditos, 2 asientos) no lo incluye. No apareció ninguna app móvil nativa de Chatbase en la búsqueda. Cobra por créditos de mensajes, en dólares. Es "helpdesk de terceros" o el propio, pero a precio de equipo. | https://chatbase.co/user-guides/chatbot/actions/chatbase-live-chat · https://myaskai.com/blog/chatbase-complete-guide-2026 · https://chatarmin.com/en/blog/chatbase-pricing · https://www.layer3labs.io/guides/chatbase-pricing |
| **Cliengo** (Buenos Aires) | Español nativo, Meta Business Partner, +9 años en LatAm. El Agente IA "si no sabe, dice que no sabe y deriva"; configura "cuándo derivar a humano, qué NO responder" y "solo pasa al humano lo que vale la pena". | El pitch es para equipos de ventas: "inbox multi-agente para tu equipo, SLA por prioridad y todo el historial en tu CRM"; Starter con 2 agentes (evidencia a favor). El contenido actual gira alrededor de WhatsApp Business API, no del widget web. No apareció ningún aviso al dueño con resumen y link para tomar control desde el celular. Cobra en dólares. | https://guiawabusiness.cliengo.com/agentes-ia · https://guiawabusiness.cliengo.com/que-es-agente-ia-whatsapp · https://guiawabusiness.cliengo.com/atender-muchos-clientes-whatsapp · https://guiawabusiness.cliengo.com/automatizaciones/calificar-y-notificar-leads-whatsapp |
| **Intercom** | — | No se buscó a propósito: su plan de entrada (Essential, por asiento, más Fin por resolución) está documentado como producto para equipos y no entra en el presupuesto de un negocio de una persona. No es candidato para este público. | (sin búsqueda; conocimiento previo, no verificado) |
| **Quickchat, SiteGPT, ChatThing, Indigo, Botnation** | Todos tienen "human handoff" documentado (aparecieron en la búsqueda de handoff de Chatbase). SiteGPT y Botnation avisan por email con un call-to-action al chat; Botnation también por sonido en el navegador. | Documentación en inglés o francés, pensados para equipos de soporte, sin precio accesible ni español verificados. Muestran que el handoff por email con link directo es un patrón común, no una invención. | https://sitegpt.ai/docs/concepts/conversations-and-handoff.md · https://support.botnation.ai/en/?p=2108 · https://docs.quickchat.ai/ai-agent/actions/human-handoff/ · https://chatthing.ai/docs/human-takeover.md |

## Matices que cambian el plan

1. **El mecanismo no es el hueco; la confiabilidad y el precio sí.** Tidio ya tiene handoff online/offline, aviso por email y push, app móvil y toma de control. Decir en la landing "nadie te avisa cuando el bot se traba" es falso y un dueño que probó Tidio lo sabe. Lo que sí se puede decir, y las reseñas lo respaldan: el aviso de los otros es opcional, lento y sin reintentos; el de BrAInance es la función central, con reintentos y medido como "tiempo hasta la primera respuesta humana".
2. **"Sin inbox multiagente" no es un beneficio que el dueño compre.** Un inbox multiagente también sirve para una persona. El argumento real es el precio de ese inbox (Crisp USD 95 con IA, Chatbase USD 150 con Help Desk, Tidio USD 39+ con Lyro) y la cantidad de cosas que hay que configurar (Tidio tiene tres medidores, Flows, tickets, email marketing). Conviene vender "no pagás por un equipo que no tenés" en vez de "no tenemos inbox multiagente".
3. **El aviso por email con link directo es el patrón estándar del mercado** (SiteGPT, Botnation, Chatbase, Tidio). La diferenciación tiene que estar en lo que ninguno mostró: motivo de la derivación, resumen de la charla, reintentos y la métrica de tiempo a primera respuesta. Si la beta no mide y muestra ese tiempo, la diferenciación es solo retórica.
4. **El plan gratuito de Tidio compite directamente con la beta gratis.** 50 conversaciones de IA en total y 50 conversaciones humanas por mes alcanzan para que un consultorio o un taller pruebe "gratis" un mes entero. BrAInance gana recién cuando el dueño llega al tope de Lyro y se encuentra con USD 39/mes en dólares. El mensaje de precio tiene que aparecer en ese momento del recorrido, no antes.
5. **Chatbase y Crisp confirman el hueco de precio, no el de función.** Ambos tienen la toma de control en vivo, pero detrás de USD 95–150 mensuales. Para el público argentino de BrAInance eso es un contraejemplo de función y un no-contraejemplo de precio; vale citarlos con el número al lado.

## Qué habría que verificar todavía

- **Tidio en español**: si el panel y la app móvil están en español, y si Lyro responde con voseo o en neutro. Es la verificación que más afecta la diferenciación "rioplatense".
- **Tidio, cuántos toques**: cuántas pantallas hay entre el push y responder como humano en la app, y si el bot queda pausado automáticamente cuando el operador escribe y se reactiva al terminar ("tomás y devolvés"). De memoria sí se pausa; no se verificó.
- **Tidio, aviso en offline**: si con "Transfer conversation to operator" en horario offline hay email obligatorio o solo push; las reseñas sugieren que el email es opcional y lento.
- **Chatbase, app móvil**: si existe una app nativa o solo web responsive; la búsqueda no devolvió ninguna.
- **Crisp Essentials**: confirmar precio actual y si el handover por IA entra en Mini (USD 45) o solo en Essentials.
- **Intercom Essential + Fin**: se descartó sin buscar; confirmar que el precio de entrada sigue fuera de rango.

## Fuentes consultadas (todas las búsquedas)

- https://help.tidio.com/hc/en-us/articles/14667264947356-How-do-flows-Lyro-and-live-agents-work-together
- https://help.tidio.com/hc/en-us/articles/9003475527196-Lyro-the-conversational-AI-chatbot
- https://apps.shopify.com/reviews/1911516
- https://aiproductivity.ai/guides/tidio-shopify-setup-guide/
- https://tooliverse.ai/tools/tidio
- https://eesel.ai/blog/tidio-pricing
- https://chatarmin.com/en/blog/tidio-pricing
- https://www.hackceleration.com/labs/tidio-pricing
- https://schedulingkit.com/es/pricing-guides/tidio-pricing
- https://www.capterra.com/p/144040/Tidio-Chat/reviews/Capterra___4628045/
- https://marcandrews.com/tidio-review-2026-ai-live-chat-tool-for-uk-businesses
- https://help.crisp.chat/en/article/getting-started-with-the-free-plan-1rjhsh5
- https://fritz.ai/crisp-ai-review/
- https://apps.shopify.com/app10199
- https://chatbase.co/user-guides/chatbot/actions/chatbase-live-chat
- https://myaskai.com/blog/chatbase-complete-guide-2026
- https://myaskai.com/blog/chatbase-pricing-explained
- https://chatarmin.com/en/blog/chatbase-pricing
- https://www.layer3labs.io/guides/chatbase-pricing
- https://www.costbench.com/software/ai-chatbot-platforms/chatbase/
- https://use-apify.com/docs/apify-vs-the-world/chatbase-review
- https://sitegpt.ai/docs/concepts/conversations-and-handoff.md
- https://support.botnation.ai/en/?p=2108
- https://docs.quickchat.ai/ai-agent/actions/human-handoff/
- https://chatthing.ai/docs/human-takeover.md
- https://guiawabusiness.cliengo.com/agentes-ia
- https://guiawabusiness.cliengo.com/que-es-agente-ia-whatsapp
- https://guiawabusiness.cliengo.com/atender-muchos-clientes-whatsapp
- https://guiawabusiness.cliengo.com/automatizaciones/calificar-y-notificar-leads-whatsapp
- https://aunoa.ai/?p=32268
