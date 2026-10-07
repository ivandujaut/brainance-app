# Refutación del hueco "primero responde, después pide el mail" (lente: LatAm, España y herramientas nativas de Meta/Google)

- Fecha: 2026-10-07
- Rol del agente: escéptico. Objetivo: refutar con evidencia verificada en vivo la afirmación de que nadie cubre este hueco para un micro-negocio argentino.
- Búsquedas realizadas: 8 (WebSearch). Los sitios de los proveedores están bloqueados por el proxy; la evidencia sale de fragmentos de búsqueda, documentación espejada (`.md` de docs, README de plugins) y páginas de terceros.
- Veredicto: **NO refutado** (`refuted=false`, `verified_live=true`), pero con un matiz grande: **la mitad "técnica" del hueco (filtro de spam y límite por IP) ya es un commodity**; lo que sigue sin contraejemplo es la mitad "de mensaje y de default" para este público.

## El hueco bajo examen

> Captura de lead sin gatekeeping (el visitante recibe la respuesta antes de que se le pida nada) y protegida contra spam (duplicados, dominios basura, límite por IP), con un contador visible para el dueño de cuántas consultas se frenaron. Como contraste explícito con los bots de conversión.

Para marcarlo como refutado hacía falta un contraejemplo concreto: producto + URL que, para un micro-negocio argentino con widget web, (a) responda por defecto antes de pedir datos y lo diga como regla, (b) filtre spam y limite por IP sin que el dueño tenga que configurarlo, (c) le muestre al dueño cuánto se frenó, y (d) esté en español rioplatense a un precio accesible. Ninguno cumple las cuatro; varios cumplen (a) y (b) como opción configurable.

## Candidatos encontrados y por qué no refutan

| Producto | Qué cubre del hueco | Qué no cubre | Fuente |
|---|---|---|---|
| **Chatbase** | Es el contraejemplo más cercano. Tiene una sección **Build > Guardrails > Auto protection** con dos tarjetas: **Rate limit** ("Limit to N messages every N seconds", por dispositivo y por cualquier canal, con mensaje personalizable al superar el tope) y **Spam detection** (revisa la conversación después del 2.º, 4.º, 8.º y 16.º mensaje y, si detecta spam, pausa la conversación y el agente deja de responder "sin gastar créditos"). La acción **Collect Leads** permite "customize when exactly the lead form gets triggered during the conversation", o sea, se puede configurar que pida el mail después de responder. Aviso por email al dueño por cada lead y webhooks. | En inglés; precio en dólares (plan gratuito con límites, Hobby ≈ USD 40/mes); todo esto es **configuración opcional** en un panel con jerga ("guardrails", "actions"), no el comportamiento por defecto ni un mensaje de producto. No aparece filtro de duplicados ni de dominios basura, ni un contador para el dueño de consultas frenadas. Público: desarrolladores y empresas, no una panadería. | https://www.chatbase.co/docs/user-guides/chatbot/guardrails · https://www.chatbase.co/docs/user-guides/chatbot/guardrails.md · https://chatbase.co/docs/user-guides/chatbot/actions/collect-leads |
| **ChatLab** | Rate limits en **Settings > Security** (valor recomendado: 40 mensajes cada 150 s). Lead collection con disparador "**after X messages**": muestra el formulario después de N mensajes, es decir, responde primero. | Inglés, dólares, mismo perfil de usuario técnico; el "responde primero" es una opción entre varias, no una regla. | https://www.chatlab.com/help/rate-limits/ · https://www.chatlab.com/help/lead-collection |
| **SiteGPT** | Disparadores combinables para el formulario de lead, incluido "After X messages"; con disparadores por IA, se le indica al bot que muestre el formulario una sola vez por conversación. | Igual que el anterior: inglés, dólares, configurable. | https://sitegpt.ai/docs/features/lead-collection · https://sitegpt.ai/docs/guides/leads/collect-leads |
| **Chatling** | Rate limit configurable a nivel de cuenta y de widget. | Inglés; planes en euros (Starter 29 €/mes); IA por créditos. | https://docs.chatling.ai/general-settings/rate-limit · https://docs.chatling.ai/chatbot/rate-limit |
| **Stammer.ai** | "Message Rate Limits" configurables por agente. | Plataforma white-label para agencias, no para el dueño final. | https://docs.stammer.ai/stammer.ai-docs/chat-ai-agents/general-settings/message-rate-limits |
| **Tidio (Lyro)** | Lyro "can capture leads in the middle of conversations"; el pre-chat survey es opcional. Se puede **banear visitantes por IP** desde la conversación y verlos en Settings > Preferences. Una conversación solo cuenta para el límite "if one of your human agents replies", así que el spam no consume cupo humano. | El baneo es **manual y a posteriori** (hay pedidos de usuarios de una forma más rápida de banear spammers); no hay límite por IP automático ni filtro de dominios. La reseñas citadas en la evidencia a favor (no se puede bloquear por referrer, miedo a cobros por "bot misuse") siguen sin respuesta en lo encontrado. Inglés/español neutro, precio en dólares/euros. | https://help.tidio.com/hc/en-us/articles/5463328751516-Banning-visitors · https://www.tidio.com/es/features/ · https://www.eesel.ai/blog/tidio-register |
| **Cliengo** (Buenos Aires) | Es el único proveedor local que apareció y **confirma la tesis del hueco, no la refuta**: la documentación del plugin oficial describe que el chatbot "inicia instantáneamente una conversación con los visitantes... teniendo como objetivo obtener sus datos de contacto (nombre, email, teléfono, etc.)" y "captura los datos de contacto de cada visitante: nombre, número de teléfono, email y consulta". El producto reciente son **WhatsApp Flows** (formularios multipantalla dentro del chat). | Es exactamente el bot de conversión que el hueco contrasta: el objetivo declarado es el dato, no la respuesta. | https://wordpress.org/plugins/cliengo/ · https://cdn.jsdelivr.net/wp/plugins/cliengo/tags/1.0.1/README.txt · https://guiawabusiness.cliengo.com/whatsapp-flows · https://www.tiendanube.com/cl/tienda-aplicaciones-nube/cliengo |
| **Smartsupp, Zoho SalesIQ, Olark, HubSpot, Elfsight** | Todos tienen "block IP"/"blocks" para chat en vivo; Smartsupp tiene una guía "how to protect your chat from spam and bots". | Live chat clásico, bloqueo manual, no IA que responda sola a las 3 de la mañana. | https://help.smartsupp.com/en/articles/16904909-how-to-protect-your-chat-from-spam-and-bots · https://olark.com/help/blocks · https://help.zoho.com/portal/en/community/topic/wfh-tip-9-keep-your-spammers-and-harassers-away-from-accessing-your-chat-window-with-block-ips · https://community.hubspot.com/t/block-user-from-chat/17876 · https://community.elfsight.com/t/block-certain-customer-from-using-the-chat/113304 |
| **Meta / Google** | — | La búsqueda no devolvió nada de Meta Business Agent ni de Google sobre captura de leads en widget web con filtro de spam; Meta opera dentro de WhatsApp (el visitante ya "dio" su número al escribir, no hay gatekeeping que evitar). No hay candidato. | (sin resultados) |

## Matices que cambian el plan

1. **"Filtro de spam + límite por IP" no es un diferenciador; es higiene de base.** Chatbase, ChatLab, Chatling, SiteGPT y Stammer lo tienen configurable, y Chatbase suma detección de spam automática que pausa la conversación. Decir "protegemos tu bot del spam" como novedad invita a la comparación y la pierde. Hay que implementarlo (ya está previsto por el tope de gasto diario) pero no venderlo como hueco.
2. **"Responde primero" tampoco es técnicamente inédito: es un disparador "after X messages" en varias herramientas.** La diferencia real es que en BrAInance sería **el único comportamiento posible** y un mensaje de producto ("tu cliente recibe la respuesta antes de que le pidamos nada"), mientras que en los competidores es una opción enterrada entre "on page load", "on exit intent" y "AI trigger". Para un dueño sin equipo, que no hay nada que configurar es el valor.
3. **Lo que sigue sin contraejemplo es la combinación con el público y el idioma:** ningún resultado mostró un producto en rioplatense, pensado para un negocio de una persona, que (a) responda primero por regla, (b) filtre duplicados y dominios basura antes de mandar el email de lead y (c) le muestre al dueño "hoy frenamos N consultas por límite". El punto (c) no apareció en ninguna herramienta: Chatbase muestra un mensaje al visitante cuando lo frena, no un contador al dueño.
4. **Cliengo es el mejor material de contraste, y es argentino.** Su documentación oficial dice que el objetivo del bot es "obtener sus datos de contacto". El mensaje "primero te respondo, después te pido el mail" funciona mejor como contraste con el proveedor local que el dueño ya vio que con Intercom o G2.
5. **El "miedo a cobros por bot misuse" de Tidio tiene respuesta directa en el tope diario por sitio**, que ya está en el producto. Conviene unir los dos mensajes: "si alguien te spamea, el bot frena y vos no pagás de más", con el contador visible como prueba.
6. **Sigue siendo coherencia con la honestidad operativa (hueco 1) más que un hueco propio.** La evidencia a favor original ya lo decía; las búsquedas lo confirman: no hay reseñas que pidan "que responda antes de pedir el mail" con esas palabras.

## Qué habría que verificar todavía

- Si **Chatbase** muestra en el panel algún conteo de conversaciones pausadas por spam o frenadas por rate limit (la doc leída no lo menciona, pero el sitio está bloqueado).
- Si **Lyro de Tidio** en su plan actual pide el mail por defecto al inicio o después de responder (la evidencia dice "mid-conversation" pero no cuál es el default al instalar).
- Si **Cliengo** agregó en 2026 un modo "responder primero" con su agente de IA (`guiawabusiness.cliengo.com/agentes-ia-ventas` habla de calificar leads, no de responder primero, pero el sitio principal está bloqueado).
- Reseñas en Capterra/G2 en español de Cliengo o Botmaker que mencionen "pide datos antes de responder" (la búsqueda no devolvió ninguna; sería la evidencia de demanda que hoy falta).

## Fuentes consultadas (todas las búsquedas)

- https://www.chatbase.co/docs/user-guides/chatbot/guardrails
- https://www.chatbase.co/docs/user-guides/chatbot/guardrails.md
- https://chatbase.co/docs/user-guides/chatbot/actions/collect-leads
- https://www.chatlab.com/help/lead-collection
- https://www.chatlab.com/help/rate-limits/
- https://help.chatlab.com/rate-limits
- https://sitegpt.ai/docs/features/lead-collection
- https://sitegpt.ai/docs/guides/leads/collect-leads
- https://www.chatnode.ai/docs/user-guides/actions/forms/collect-leads
- https://docs.chatling.ai/general-settings/rate-limit
- https://docs.chatling.ai/chatbot/rate-limit
- https://docs.stammer.ai/stammer.ai-docs/chat-ai-agents/general-settings/message-rate-limits
- https://docs.purethemes.net/puriochat/knowledge-base/rate-limits/
- https://docs.flowiseai.com/espanol/documentacion-oficial/configuracion/rate-limit
- https://insertchat.com/glossary/rate-limiting-chatbot
- https://help.tidio.com/hc/en-us/articles/5463328751516-Banning-visitors
- https://help.tidio.com/hc/en-us/articles/5399003714204
- https://www.tidio.com/es/features/
- https://www.eesel.ai/blog/tidio-register
- https://customerthink.com/?p=1061108
- https://wordpress.org/plugins/cliengo/
- https://cdn.jsdelivr.net/wp/plugins/cliengo/tags/1.0.1/README.txt
- https://guiawabusiness.cliengo.com/whatsapp-flows
- https://www.tiendanube.com/cl/tienda-aplicaciones-nube/cliengo
- https://upnify.com/en/help/integrations/cliengo-integration.html
- https://help.smartsupp.com/en/articles/16904909-how-to-protect-your-chat-from-spam-and-bots
- https://olark.com/help/blocks
- https://help.zoho.com/portal/en/community/topic/wfh-tip-9-keep-your-spammers-and-harassers-away-from-accessing-your-chat-window-with-block-ips
- https://community.hubspot.com/t/block-user-from-chat/17876
- https://community.elfsight.com/t/block-certain-customer-from-using-the-chat/113304
- https://community.unbounce.com/ask-a-question-41/duplicate-form-submissions-leads-recorded-in-spam-4065
