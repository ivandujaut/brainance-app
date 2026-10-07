<!-- Investigación de mercado hecha el 2026-10-07 con 20 agentes: 6 investigaciones con búsqueda web, una síntesis, 12 refutaciones adversariales (2 por hueco, todas con búsqueda en vivo) y el informe. Es una foto del mercado a esa fecha. -->

# Mercado de chat con IA para pymes: dónde está todo el mundo y dónde no hay nadie

> Nota metodológica: cada hueco fue refutado por dos revisores y los 12 votos se hicieron con búsquedas en vivo (8 por voto), con los sitios de los proveedores bloqueados por el proxy.
> Las cifras de precios salen de fuentes secundarias (comparativas, Capterra, blogs); confirmarlas antes de usarlas en público.

## 1. Qué tienen en común

| Punto | Quiénes |
|---|---|
| Misma promesa: "entrená el bot con tu web, pegá un script, responde 24/7" | Tidio, Chatbase, SiteGPT, Crisp, Cliengo, Botmaker |
| Titular de autoresolución o "vendé más", nunca honestidad (real en pymes: 38–53 %) | Tidio, Quidget, HubSpot, Intercom, Zendesk, Cliengo |
| Cobro en USD con medidores apilados y sin tope | Globales y regionales por igual |
| Diseñados para equipos: asientos, mínimos de 2–3 usuarios | Zendesk, Intercom, Crisp, Cliengo, Wati, Whaticket |
| WhatsApp como canal rey; el widget web es accesorio | Todos los regionales |
| Como máximo "español latinoamericano", nunca voseo | Fin, Chatbase, Freshworks, Cliengo, Landbot |
| Freemium con la IA útil detrás del pago | Tidio, HubSpot, Chatbase, SiteGPT |
| Mismas quejas: inventa, soporte lento, facturación sorpresa | Chatbase, Tidio, Intercom, ManyChat, Cliengo |

## 2. La zona más atendida

No competir en bots de WhatsApp para pymes (Cliengo, Botmaker, Wati, Kommo, más de 100 empresas argentinas): Meta acaba de comoditizar esa capa con el Meta Business Agent, nativo, en Argentina y casi gratis. Tampoco en el "chatbot entrenado con tu web" por créditos en inglés (Chatbase, SiteGPT, Tawk.to gratis): productos intercambiables que compiten por precio por mensaje. Ni en helpdesks mid-market (Zendesk, Intercom), donde el micro-negocio es irrelevante. Y no competir con el titular "24/7, vos dormís": es la frase de todos.

## 3. Huecos verificados

**g1. Honestidad operativa como promesa central.** Sólido, 2/2 en vivo. "Responde solo con lo que cargaste; cuando no sabe, no inventa y te deriva", con métrica pública. Evidencia: alucinación es la queja n.º 1 en 3.230 reseñas de G2 (learn.g2.com); Chatbase "genera una respuesta errónea con la mayor elocuencia" (capterra.com/p/10012414). Refutadores: el mecanismo es commodity (Lyro "dice que no sabe", Cliengo deriva "si no sabe", Vozia lo promete por US$1.000 + 100/mes, Ada y BotBrains miden handoff rate), pero nadie lo pone en el titular ni publica métrica o eval, y Fin y Zendesk cobran la derivación como "resolución". Producto: titular, % de derivadas visible al dueño, eval publicado, nunca cobrar una derivación. Ya hay spec 001, eval de 75 casos y motivo `derivation`. Riesgo: la métrica tiene que ser buena antes de publicarla.

**g2. Precio plano por sitio con tope que el dueño fija.** Sólido, 2/2. Evidencia: Tidio con tres medidores de US$29 a más de US$200 (dragapp.com); Chatbase se apaga sin auto-recarga (costbench.com); Cliengo "carísima... 120 mensajes diarios" (capterra.com.ar). Contraejemplos: Fabio AI Chatbot (EUR 8/mes por sitio, ilimitado, solo WordPress), Chat Nube cobra en pesos pero por conversación, Crisp por workspace pero la IA por créditos. Nadie tiene tope visible y editable que al tocarse deriva en vez de apagarse. Ya hay tope US$2/día (spec 007), solo visible al operador. Falta mostrarlo y decir qué pasa después de lo gratis.

**g3. Handoff para una persona sin turno fijo.** Sólido, 2/2. Evidencia: reseñas de 1 estrella de Tidio, "notify via email faster when the bot gets stuck" (apps.shopify.com/reviews/1911516); mínimos de 2–3 usuarios en Cliengo, Wati, Whaticket. Refutadores: "nadie avisa" es falso (Tidio, Chatbase, SiteGPT y Crisp avisan por email o push) y Meta Business Agent cubre el hueco entero en WhatsApp, gratis y desde el celular (wati.io/blog/meta-business-agent). Lo que ninguno mostró: motivo, resumen, reintentos y "tiempo hasta la primera respuesta humana". Ya hay bandeja y "Tomar el control"; la spec 006 excluye las notificaciones, que es lo decisivo.

**g4. Rioplatense con voseo y plantillas por rubro.** Sólido, 2/2, pero de percepción. Solo Freshworks distingue Spanish (LATAM) (crmsupport.freshworks.com); Cliengo dice "latinoamericano", nunca voseo. Contraejemplos: Kommo (6 plantillas por industria, flujos de WhatsApp), Jotform (traducidas), Chat Nube ("tono de marca"), Órbita (consultorios). El voseo se configura en un prompt en días (coderhouse.com); la defensa es declararlo, probarlo con el eval y plantillas con contenido de barrio (obra social, seña, monotributo). Ya hay trato vos/usted; faltan plantillas.

**g5. Instalación sin fricción para el que ya tiene web.** Sólido, 2/2, el más chico. "URL + una línea" lo hacen gratis Chatling (eesel.ai/blog/chatling-review), Chatbase y Lyro; Wix trae chat de IA (inglés). Lo distinto: free que no se apaga ni se borra, en español, con defaults de no inventar y derivar; Cliengo pasó a onboarding "en 7 días" con WhatsApp API. Inmobiliarias ya tienen Mirando.ai; priorizar consultorios, contadores, talleres, gimnasios.

**g6. Primero responde, después pide el mail.** Parcial, 2/2. Chatbase, ChatLab y SiteGPT tienen "lead form after X messages" configurable (chatbase.co/docs); Cliengo declara que el objetivo del bot es "obtener los datos de contacto" (wordpress.org/plugins/cliengo). Es coherencia con g1, no hueco propio. Ya hay tarjeta después de la primera respuesta; falta decirlo y el límite por IP.

Descartados: ninguno.

## 4. Lo que juega en contra

- El 86 % de los argentinos habla con comercios por WhatsApp y el 48 % de las pymes no tiene web; panaderías y locales de ropa viven en Instagram.
- Meta Business Agent es gratis, nativo, deriva a persona y está en Argentina: el sustituto real no es Cliengo.
- El precio no es foso: Tawk.to gratis está en el 15,4 % de los sitios argentinos con chat; Cliengo tiene plan gratis desde 2017.
- Sin honestidad y "una sola persona", BrAInance es "Cliengo sin WhatsApp".
- El titular actual compite en la zona más saturada.
- Los huecos son de posicionamiento y UX, copiables en semanas; el foso solo se construye con datos publicados.
- 64 % preferiría que las empresas no usen IA en atención (Gartner).
- Faltan datos: nadie desagrega micro-negocios, "voseo" y "cobro en dólares" no aparecen como quejas, y sigue abierto si una panadería paga por un chat web.
- Hoy nadie le avisa al dueño cuando el bot se traba: el fallo más castigado.
- No hay turnos, y "agendar" es la feature estrella de la categoría.

## 5. Recomendación de posicionamiento

**Frase:** "Responde con tus datos, en tu idioma. Lo que no sabe, te lo pasa a vos. Y nunca pagás más de lo que fijaste."

**Mensajes:**
1. No inventa: responde solo con lo que cargaste y deriva a tu WhatsApp; te mostramos cuántas veces.
2. El handoff es a vos, en tu celular, con motivo y resumen; si no contestás, te volvemos a avisar.
3. Un precio por sitio, en pesos, con tope que ponés vos: si se llega, no se apaga, deriva.

**Próximo mes:**
1. Email de "Necesita atención" con motivo, resumen, link directo, reintentos y medición del tiempo hasta la primera respuesta humana. (No existe; lo más urgente.)
2. Titular de la landing con la promesa de honestidad y publicación del eval en rioplatense. (Eval y comportamiento existen; la landing lo tiene como celda del bento.)
3. Tope diario y consumo visibles y editables por el dueño, más plantillas de FAQ por rubro. (El tope existe internamente; las plantillas no.)

## Anexos

Las notas de cada refutación, con las búsquedas y los contraejemplos que respaldan la sección 3, están en [`refutaciones/`](refutaciones/): un archivo por hueco y lente (`--latam` o `--global`).

## Fuentes

- G2, alucinación queja n.º 1: https://learn.g2.com/ai-chatbot-hype-vs.-reality-what-g2-data-reveals-about-buyer-experience
- G2 Death by Chatbot: https://images.g2crowd.com/uploads/attachment/file/1504257/Death-by-Chatbot---The-State-of-Chatbots-in-2025---eBook---Breakout-22MAY2025.pdf
- Chatbase inventa (Capterra): https://www.capterra.com/p/10012414/Chatbase/reviews/?page=3
- YouGov, responsabilidad por errores del bot: https://yougov.com/articles/49729-consumers-hold-companies-responsible-for-ai-chatbot-errors
- Gartner 64 %: https://www.gartner.com/en/newsroom/press-releases/2024-07-09-gartner-survey-finds-64-percent-of-customers-would-prefer-that-companies-didnt-use-ai-for-customer-service
- Resolución real 38–53 %: https://superframeworks.com/articles/best-ai-customer-support-tools
- Tidio Lyro "no sabe": https://www.getmacha.com/blog/tidio-lyro-explained
- Tidio handoff docs: https://help.tidio.com/hc/en-us/articles/14667264947356-How-do-flows-Lyro-and-live-agents-work-together
- Tidio precios: https://www.dragapp.com/blog/tidio-pricing/
- Tidio costos ocultos: https://www.costbench.com/software/live-chat/tidio-live-chat/hidden-costs/
- Tidio reseñas Shopify: https://apps.shopify.com/reviews/1028550 ; https://apps.shopify.com/reviews/1911516
- Zendesk pricing IA: https://eesel.ai/blog/zendesk-ai-pricing/
- Zendesk adopción por tamaño: https://sacra.com/research/zendesk
- Intercom Fin pricing: https://www.gleap.io/blog/intercom-fin-ai-pricing-2026
- Chatbase costos ocultos: https://www.costbench.com/software/ai-chatbot-platforms/chatbase/hidden-costs/
- Chatbase Collect leads: https://chatbase.co/docs/user-guides/chatbot/actions/collect-leads
- Chatbase Guardrails: https://www.chatbase.co/docs/user-guides/chatbot/guardrails
- Chatbase Live Chat: https://chatbase.co/user-guides/chatbot/actions/chatbase-live-chat
- ChatLab lead collection: https://www.chatlab.com/help/lead-collection
- SiteGPT lead collection: https://sitegpt.ai/docs/features/lead-collection
- Chatling: https://www.eesel.ai/blog/chatling-review
- Crisp precios: https://www.dragapp.com/blog/crisp-pricing/
- Crisp plan free: https://help.crisp.chat/en/article/getting-started-with-the-free-plan-1rjhsh5
- Fabio AI Chatbot: https://www.capterra.com/p/10036823/Fabio-AI-Chatbot
- Chat Nube: https://ayuda.tiendanube.com/activar-chat-nube/que-es-chat-nube
- Cliengo reseñas: https://www.capterra.com.ar/reviews/158756/cliengo
- Cliengo planes: https://softwarefinder.com/artificial-intelligence/cliengo
- Cliengo agentes IA: https://guiawabusiness.cliengo.com/agentes-ia
- Cliengo objetivo del bot: https://wordpress.org/plugins/cliengo/
- Cliengo vs Botmaker: https://guiawabusiness.cliengo.com/comparativas/cliengo-vs-botmaker
- Meta Business Agent global: https://www.techcrunch.com/2026/06/03/metas-ai-agent-for-whatsapp-business-is-now-available-globally/
- Meta Business Agent handoff: https://www.wati.io/blog/meta-business-agent
- Meta Business AI en Argentina: https://www.coderhouse.com/ar/coderlibrary/meta-agente-ia-whatsapp-business-latam
- Vozia / DuoTach: https://duotach.com/blog/mejores-chatbots-whatsapp-argentina
- BotBrains métrica: https://docs.botbrains.io/concepts/chat-performance
- Ada métricas: https://docs.ada.cx/measure-overview
- Kommo plantillas: https://www.kommo.com/es/blog/plantillas-de-chatbot-para-diferentes-industrias/
- Jotform plantillas: https://www.jotform.com/es/ai/chatbot/templates/
- Órbita consultorios: https://www.ambito.com/tecnologia/desarrollo-nacional-crearon-una-ia-argentina-que-organiza-turnos-medicos-whatsapp-y-ya-se-prueba-consultorios-n6304027/amp
- Mirando.ai inmobiliarias: https://infonegocios.info/enfoque/dejaron-meta-para-crear-una-ia-inmobiliaria-argentina-ya-representa-la-mitad-del-negocio-brasil-es-el-proximo-paso
- Wix Smart Chat: https://wix.com/press-room/home/post/wix-releases-ai-feature-for-businesses-to-engage-with-their-customers-online
- Coderhouse, voseo por prompt: https://www.coderhouse.com/ar/coderlibrary/crear-chatbot-ia-negocio-sin-programar-2026
- Freshworks idiomas: https://crmsupport.freshworks.com/en/support/solutions/articles/50000009278-freddy-ai-features-language-supported
- Wati precios: https://chatarmin.com/en/blog/wati-pricing
- Whaticket precios: https://zoftwarehub.com/products/whaticket/pricing
- Live chat en Argentina: https://www.wmtips.com/technologies/live-chats/country/ar
- CACE WhatsApp 86 %: https://mercado.com.ar/ruta-digital/el-comercio-electronico-argentino-crece-79-en-2025-y-whatsapp-transforma-la-relacion-comercial
- CEPE-UTDT/Fundar: https://www.lagaceta.com.ar/nota/1134784/economia/cada-vez-mas-pequenas-medianas-empresas-argentinas-operan-ia.html
- Adopción agentes IA pymes AR: https://developargentina.com/estadisticas/ia-adopcion-pymes-argentina-2026
- Mercado por tamaño: https://mordorintelligence.com/industry-reports/global-chatbot-market
- chatbot.com promesa 24/7: https://www.chatbot.com/solutions/ai-chatbot-for-small-business/
- Licencias en pesos: https://www.computerweekly.com/es/cronica/Empresas-argentinas-migran-a-licencias-y-proveedores-en-moneda-local

---
Informe guardado en: /home/user/brainance-app/docs/research/2026-10-07-informe-posicionamiento-chat-ia-pymes.md (sin commitear; los informes de cada refutador están en la misma carpeta).