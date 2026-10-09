# Políticas de Meta para WhatsApp Business y riesgos operativos para un producto con IA (talleres, Argentina)

> Notas de investigación al 9 de octubre de 2026. Cada afirmación lleva fecha y fuente.
>
> **Cómo leer las fuentes.** Las marcas son: [primaria] para Meta, reguladores y textos legales; [prensa] para medios; [BSP/blog] para proveedores de WhatsApp o blogs de vendedores, que son secundarios; [anecdótica] para foros y relatos sin verificar.
>
> **Limitación de esta sesión.** El proxy de salida bloqueó la lectura directa de whatsapp.com, business.whatsapp.com, developers.facebook.com, techcrunch.com y los sitios de la Comisión Europea, la AGCM y argentina.gob.ar. Todo lo que sigue sale de fragmentos y resúmenes de buscador de esas páginas. Las citas textuales de los términos de Meta hay que cotejarlas con la página oficial antes de usarlas en un ADR o en un contrato.

## 1. La cláusula "AI Providers" de los Business Solution Terms (vigente desde el 15-01-2026): texto, alcance, aplicación, acciones antimonopolio y cómo encajan la fase 1 y la fase 2

### Takeaway
Meta prohíbe a los "AI Providers" usar la WhatsApp Business Solution cuando la IA es la funcionalidad *principal* que ofrecen, "y no incidental o accesoria". Lo decide Meta "a su sola discreción". La fase 2 (bot de atención del taller) es exactamente el caso que Meta dijo que no afecta. La fase 1 (asistente de gestión del taller a través del número de la startup) cae en una zona gris: lo más probable es que se considere un servicio de negocio que usa IA, pero la redacción permite a Meta clasificarla como "AI Provider" si el producto se percibe como un asistente conversacional. Fuera de la UE, Italia y Brasil, la prohibición sigue vigente en Argentina.

### Cited Findings

**Texto y definiciones**
- La sección "AI Providers" (una fuente la numera 4.7) define como AI Providers a los "providers and developers of artificial intelligence or machine learning technologies, including but not limited to large language models, generative artificial intelligence platforms, general-purpose artificial intelligence assistants, or similar technologies as determined by Meta in its sole discretion". A esos proveedores se les prohíbe estrictamente ("strictly prohibited") acceder o usar la Business Solution, directa o indirectamente, para ofrecer, vender o poner a disposición esas tecnologías "when such technologies are the primary (rather than incidental or ancillary) functionality being made available for use, as determined by Meta in its sole discretion". Fuentes: [primaria, no leída directamente] [WhatsApp Business Solution Terms](https://www.whatsapp.com/legal/business-solution-terms); reproducido por [prensa] [TechCrunch, 18-10-2025](https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform/) y [MediaNama, oct-2025](https://www.medianama.com/2025/10/223-whatsapp-bans-external-ai-providers-business-api/).
- La cláusula no define "primary functionality". La determinación queda "a sola discreción" de Meta y no hay umbrales ni criterios publicados. Fuente: [BSP/blog] [remio.ai](https://www.remio.ai/post/why-whatsapp-banned-ai-chatbots-meta-s-new-api-policy-explained), que resume el texto oficial.
- Fechas de entrada en vigor:
  - los usuarios nuevos de la API registrados desde el 15-10-2025 quedaron sujetos de inmediato;
  - los existentes, desde el 15-01-2026.

  Fuentes: [BSP/blog] [learnmind.ai](https://www.learnmind.ai/blog-post/whatsapp-business-ai-chatbot-2026-policy-guide); [prensa] [TechCrunch, 18-10-2025](https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform/).
- Fecha de "última modificación" de los términos: las fuentes no coinciden. Una cita el 28-10-2025 ([green-api](https://green-api.com/en/blog/2025/AI-Changes-to-WhatsApp-terms/), BSP/blog) y otra el 06-03-2026 ([sumgenius.ai](https://sumgenius.ai/blog/whatsapp-business-ai-bot-rules-2026/), BSP/blog). Es posible que el texto vigente difiera del de octubre de 2025.
- Una traducción periodística resume el criterio así: "Generative platforms or general-purpose assistants will be banned if their primary functionality is conversational interaction". Es una paráfrasis, no el texto oficial. Fuente: [BSP/blog] [learnmind.ai](https://www.learnmind.ai/blog-post/whatsapp-business-ai-chatbot-2026-policy-guide), que cita a un diario.

**Qué queda permitido explícitamente**
- Meta le dijo a TechCrunch (18-10-2025) que el cambio "doesn't affect businesses that are using AI to serve customers on WhatsApp". Su ejemplo: una agencia de viajes con un bot de atención al cliente no queda excluida. Fuente: [prensa] [TechCrunch](https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform/).
- Los blogs de BSP describen como permitidos la atención al cliente, las reservas, el seguimiento de pedidos y la venta de billetes. Son interpretaciones, no texto de Meta. Fuentes: [BSP/blog] [azguards](https://azguards.com/artificial-intelligence/what-metas-2026-whatsapp-chatbot-ban-means-for-businesses-explained/) y [serviceform](https://www.serviceform.com/blogs/whatsapp-ai-chatbots-in-2026).

**Restricción de datos (importa aunque el producto no sea "AI Provider")**
- Los mismos términos prohíben usar Business Solution Data, incluidas sus versiones anonimizadas, agregadas o derivadas, para crear o mejorar sistemas de ML o IA, LLM incluidos. Tampoco se puede permitir ese uso, ni directa ni indirectamente.
- Se permite el fine-tuning de un modelo para uso exclusivo de la empresa, siempre que ese modelo no se use después para entrenar otros.
- Una empresa puede contratar a un AI Provider como proveedor de servicios, con un contrato que le impida entrenar con esos datos. Meta hace responsable a la empresa por lo que haga su proveedor.
- Meta puede rescindir la cuenta si determina que hubo incumplimiento, y la cláusula sobrevive a la terminación.

Fuentes: [BSP/blog] [green-api](https://green-api.com/en/blog/2025/AI-Changes-to-WhatsApp-terms/), [visitoai](https://www.visitoai.com/blog/whatsapp-ai-assistant-policy) y [Turn.io](https://learn.turn.io/l/en/article/khmn56xu3a-whats-app-s-2026-ai-policy-explained). La redacción exacta no está verificada contra la página oficial.

**Aplicación desde enero de 2026**
- Dejaron WhatsApp por la nueva política ChatGPT, Copilot, Perplexity, Luzia, Zapia y Poke. Fuentes: [prensa] [La Nación, 05-12-2025](https://www.lanacion.com.ar/tecnologia/por-que-chatgpt-copilot-zapia-luzia-y-otras-herramientas-se-van-de-whatsapp-nid05122025/) y [Xataka](https://www.xataka.com/aplicaciones/whatsapp-prohibe-acceso-a-chatgpt-a-luzia-a-todos-chatbots-generalistas-solo-sobrevive-uno).
- Zapia (startup uruguaya, Brainlogic AI) dejó de operar dentro de WhatsApp el 15-01-2026 en países como México, **Argentina** y Colombia, y siguió operando en Brasil. Fuentes: [primaria, de la empresa] [blog de Zapia](https://zapia.com/blog/zapia-whatsapp-stopped-working-what-happened?lang=en); [prensa] [El Observador](https://www.elobservador.com.uy/ciencia-y-tecnologia/la-startup-uruguaya-zapia-presenta-acciones-legales-contra-meta-brasil-y-europa-exigirle-abandonar-whatsapp-n6026774) y [Startups.com.br](https://startups.com.br/negocios/zapia-segue-no-whatsapp-e-critica-regras-da-meta-apos-intervencao-do-cade/).
- A los desarrolladores afectados, Meta les pidió dejar de responder consultas y enviar autorespuestas preaprobadas. La exención de Brasil (+55) levantó ese requisito para los números brasileños. Fuente: [prensa] [TechCrunch, 15-01-2026](https://techcrunch.com/2026/01/15/after-italy-whatsapp-excludes-brazil-from-rival-chatbot-ban).
- Meta justificó la medida en que la avalancha de chatbots de terceros sobrecargaba una infraestructura de la Business API que no estaba pensada para ese uso. Fuente: [prensa] [TechCrunch, 15-01-2026](https://techcrunch.com/2026/01/15/after-italy-whatsapp-excludes-brazil-from-rival-chatbot-ban).
- Sobre empresas comunes (no proveedores de IA), un blog describe dos olas: primero, advertencias en el Business Manager; después, caídas de calidad en cuentas cuyos bots generaban muchos bloqueos o reportes de spam por conversaciones fuera de tema. Otro blog afirma que hubo "cientos" de empresas afectadas, pero no da nombres ni cifras. Fuentes: [anecdótica/BSP] [Bunny Honey Club](https://blog.bunnyhoneyclub.com/posts/whatsapp-ai-chatbot-ban-2026-compliance) y [serviceform](https://www.serviceform.com/blogs/whatsapp-ai-chatbots-in-2026).

**Italia (AGCM)**
- Julio de 2025: la AGCM abrió una investigación por abuso de posición dominante (art. 102 TFUE) por la integración de Meta AI en WhatsApp.
- 26-11-2025: la extendió a los nuevos Business Solution Terms y abrió un procedimiento cautelar.
- 22 o 23-12-2025 (las fuentes difieren): ordenó suspender las cláusulas en Italia y pidió un informe de cumplimiento en 15 días.

Fuentes: [prensa] [Cybersecurity360](https://www.cybersecurity360.it/news/lantitrust-ferma-meta-su-whatsapp-stop-allesclusione-dei-chatbot-ai-rivali/), [Agenda Digitale](https://agendadigitale.eu/mercati-digitali/lantitrust-blocca-meta-i-chatbot-ai-restano-su-whatsapp) y [Money.it](https://www.money.it/misura-cautelare-contro-meta-ai-i-termini-di-whatsapp-non-possono-vietare-chatbot-concorrenti). Un resumen secundario fechó la medida en "diciembre de 2024"; es un error, fue en diciembre de 2025.
- Meta exceptuó a los números +39. Desde el 16-02-2026 cobra a los AI Providers en Italia US$0,0691, €0,0572 o £0,0498 por respuesta sin plantilla. Fuentes: [prensa] [TechCrunch](https://techcrunch.com/?p=3087325) y [Techbuzz](https://www.techbuzz.ai/articles/meta-charges-ai-chatbot-devs-0-07-msg-on-whatsapp-in-italy).

**Brasil (CADE)**
- Enero de 2026: CADE dictó una medida preventiva, que un juzgado suspendió días después, y abrió una investigación a raíz de la denuncia de Factoría Elcano (Luzia) y Brainlogic AI (Zapia).
- Meta exceptuó a los números +55. Fuente: [prensa] [TechCrunch, 13-01-2026](https://techcrunch.com/2026/01/13/brazil-orders-meta-to-suspend-policy-banning-third-party-ai-chatbots-from-whatsapp) y [TechCrunch, 15-01-2026](https://techcrunch.com/2026/01/15/after-italy-whatsapp-excludes-brazil-from-rival-chatbot-ban).
- 04-03-2026: el Tribunal del CADE rechazó por unanimidad el recurso de Meta y mantuvo la preventiva. Fuentes: [prensa] [CNN Brasil](https://www.cnnbrasil.com.br/economia/negocios/cade-mantem-medida-preventiva-que-obriga-meta-a-permitir-chatbots-de-ia-no-whatsapp/) y [Mercado&Consumo](https://mercadoeconsumo.com.br/04/03/2026/noticias/cade-mantem-medida-preventiva-que-obriga-meta-a-permitir-chatbots-de-ia-no-whatsapp/).
- Después, Meta empezó a cobrar a los chatbots de IA en Brasil con la tarifa de marketing. CADE consideró que eso incumplía la preventiva y mantuvo una multa diaria de R$250.000. Fuentes: [prensa] [Tecnoblog](https://tecnoblog.net/noticias/cade-mantem-multa-diaria-de-r-250-mil-contra-meta/) y [Convergência Digital](https://convergenciadigital.com.br/mercado/cade-sustenta-multa-ao-whatsapp-por-manter-restricao-de-uso-a-ia-generativa-na-plataforma/).
- Según un resumen de buscador, la documentación de Meta incluye a Brasil entre los mercados donde las reglas o tarifas para AI Providers rigen desde el 11-03-2026. No pude confirmarlo. Fuente: [primaria, no leída] [Meta, pricing/ai-providers](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ai-providers/).

**Unión Europea (Comisión, caso AT.41034)**
- La Comisión abrió una investigación (caso AT.41034). Fuente: [Digital Policy Alert](https://digitalpolicyalert.org/change/17349).
- 09-02-2026: Pliego de Cargos con intención de dictar medidas cautelares. Fuente: [prensa] [CNBC](https://www.cnbc.com/2026/02/09/eu-interim-measures-meta-whatsapp-ai-policy-antritrust.html).
- 04/05-03-2026: Meta volvió a aceptar asistentes de IA generalistas en el EEE, a cambio de €0,0490 a €0,1323 por mensaje sin plantilla. Fuentes: [prensa] [TechCrunch, 05-03-2026](https://techcrunch.com/2026/03/05/meta-will-allow-rival-ai-chatbots-on-whatsapp-in-europe-but-for-a-fee/) y [BSP/blog] [ALM Corp](https://almcorp.com/blog/meta-whatsapp-rival-ai-chatbots-eu/).
- 15-04-2026: Pliego de Cargos complementario.
- 09-06-2026: la Comisión impuso medidas cautelares:
  - restituir el acceso gratuito con los términos anteriores al 15-10-2025, en 5 días hábiles y hasta la decisión final;
  - la Comisión consideró que la tarifa equivalía en la práctica a la prohibición;
  - el incumplimiento expone a multas de hasta el 10 % de la facturación y a multas coercitivas de hasta el 5 % de la facturación diaria.

  Fuentes: [prensa] [EU Perspectives](https://euperspectives.eu/2026/06/commission-gives-meta-five-days-to-open-whatsapp-ai-to-competition/), [Bloomberg, 09-06-2026](https://www.bloomberg.com/news/articles/2026-06-09/meta-ordered-by-eu-to-halt-whatsapp-curbs-on-ai-rivals) y [Global Competition Review](https://globalcompetitionreview.com/article/eu-hits-meta-interim-measures-in-whatsapp-ai-probe); análisis legal de [Houthoff](https://www.houthoff.com/insights/news/a-rare-show-offorce-commission-deploys-interim-measures-against-meta-to-safeguard-ai-competition/).
- Meta calificó la medida de "regulatory overreach" y anunció que apelará. Fuente: [prensa] [GA Alliance](https://www.ga-alliance.eu/en/eu-commission-imposes-interim-measures-on-meta/) y otros. No encontré confirmación de la apelación presentada.
- ChatGPT volvió a WhatsApp en Europa hacia julio de 2026. Fuentes: [prensa] [Dire.it, 14-07-2026](https://www.dire.it/14-07-2026/1255464-chatgpt-torna-su-whatsapp-in-europa-come-usarlo-senza-registrarsi/); un blog da la fecha del 13-07-2026, [BSP/blog] [Bunny Honey Club](https://blog.bunnyhoneyclub.com/posts/whatsapp-ai-chatbot-ban-2026-compliance).

**Meta como competidor directo**
- 03-06-2026: Meta lanzó "Meta Business Agent", su propio agente de IA para empresas en WhatsApp. Lo cobra por tokens desde el 01-08-2026, a unos US$2 por millón de tokens, y desde septiembre lo vende en planes pagos (Meta One). Fuentes: [primaria] [blog de WhatsApp Business, Conversations 2026](https://whatsappbusiness.com/blog/introducing-meta-business-agent-ai/); [prensa] [Tech Times, 16-07-2026](https://www.techtimes.com/articles/320787/20260716/meta-business-agent-billing-starts-aug-1-free-test-window-ends-days.htm); [BSP/blog] [imbee](https://www.imbee.io/resource/meta-one-business-plans-whatsapp).

### Inferences

**Fase 2: bot del taller que atiende a sus clientes, en el número del taller**
- Es, casi literalmente, el ejemplo que Meta dio como permitido (atención al cliente de una empresa).
- El "servicio" es la reparación de autos; la IA es accesoria. El riesgo de que la cláusula se aplique es **bajo**.
- El riesgo real está en otro lado: calidad, opt-in, escalamiento humano y fuga de datos entre clientes (ver la sección 2). También aparece un competidor nativo, Meta Business Agent, que el taller podría activar por su cuenta.

**Fase 1: número propio de la startup, el dueño del taller como cliente**
- **Zona gris.** El dueño conversa con un LLM que extrae fichas, responde preguntas sobre sus datos y manda un resumen.
- **Argumentos para que sea "incidental":**
  - el producto es un software de gestión vertical (CRM y órdenes de trabajo), y WhatsApp es un canal de carga y consulta;
  - no es un asistente generalista ni un modelo que se ofrece a terceros;
  - la startup es una empresa que le habla a sus propios clientes sobre el servicio que les vende.
- **Argumentos en contra:**
  - la interacción conversacional con la IA *es* la experiencia principal en WhatsApp;
  - la decisión es "a sola discreción" de Meta;
  - la paráfrasis periodística ("primary functionality is conversational interaction") cubriría un asistente vertical si Meta la adopta.
- **Mitigaciones razonables:**
  - restringir el dominio: que el bot rechace preguntas ajenas al taller;
  - presentar y comercializar el producto como software de gestión, no como "ChatGPT para talleres";
  - mantener un panel web como sistema de registro;
  - evitar funciones de asistente general (redacción libre, preguntas de cultura general).
- **Una salida de cobertura:** el caso de la UE muestra que, si Meta clasifica un uso como AI Provider, la respuesta posible es cobrarlo (Italia, EEE, Brasil) además de prohibirlo. Fuera de esas jurisdicciones, la consecuencia es la exclusión.

**Las dos fases**
- Los datos que llegan por WhatsApp son Business Solution Data.
- El proveedor de LLM (Anthropic, OpenAI u otro, vía gateway) tiene que estar contratado sin derecho a entrenar con esos datos, y conviene documentarlo.
- Un fine-tuning con datos de un taller no se puede reutilizar para otros si el modelo base se entrena con ellos.

**Argentina**
- No tiene exención: el caso Zapia lo confirma.
- La protección regulatoria que tuvieron Italia, Brasil y el EEE no existe acá, y no encontré ninguna acción de la CNDC argentina.

### Gaps
- No pude leer el texto vigente en whatsapp.com (bloqueado), así que no confirmé si la versión del 06-03-2026 cambió la redacción. Hay que cotejarlo antes del ADR.
- No encontré ningún FAQ ni guía oficial de Meta que defina "primary functionality" o dé ejemplos de asistentes *verticales* (para un rubro o de productividad). Tampoco encontré casos públicos de SaaS verticales clasificados como AI Provider.
- No encontré si Meta apeló o cumplió formalmente las medidas cautelares de la UE, más allá del regreso de ChatGPT en Europa.
- No hay noticias de acciones de la CNDC ni de otros reguladores latinoamericanos fuera de Brasil.

## 2. Business Messaging Policy y Commerce Policy: opt-in, escalamiento a humano, contenido prohibido, mensajería automatizada y datos de terceros

### Takeaway
Para las dos fases, las reglas que más pesan son cuatro:
- solo se puede escribir a quien dio su número y aceptó recibir mensajes (opt-in);
- fuera de la ventana de 24 h solo se pueden mandar plantillas aprobadas;
- en un bot automatizado tiene que haber un camino claro a un humano;
- no se piden identificadores sensibles (tarjetas, cuentas, documentos) ni se comparte información de un cliente con otro.

La Commerce Policy no parece afectar a la reparación de autos.

### Cited Findings
- **Opt-in:** solo se puede escribir a personas que (a) dieron su número y (b) aceptaron recibir mensajes posteriores. Hay que respetar las bajas de inmediato. Fuentes: [primaria, no leída] [WhatsApp Business Messaging Policy](https://business.whatsapp.com/policy); [BSP/blog] [Infobip](https://www.infobip.com/blog/how-to-collect-whatsapp-business-opt-ins) y [SignalWire](https://signalwire.com/blog/whatsapp-business-messaging).
- **Alcance del opt-in:** las fuentes secundarias no coinciden. Infobip dice que alcanza con un opt-in general si se informa qué tipo de mensajes se enviarán. Ominiflow recomienda opt-ins separados por categoría. Fuentes: [BSP/blog] [Infobip](https://www.infobip.com/blog/how-to-collect-whatsapp-business-opt-ins) y [Ominiflow](https://ominiflow.com/blog/whatsapp-business-messaging-policy).
- **Ventana de 24 h y plantillas:** los mensajes sin plantilla solo se pueden enviar dentro de la ventana de atención, que dura 24 h desde el último mensaje del usuario. Fuera de ella hacen falta plantillas aprobadas, de categoría marketing, utility o authentication. Fuentes: [primaria] [Meta, Pricing on the WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp/pricing); [BSP/blog] [Gallabox](https://docs.gallabox.com/pricing-and-billing-modules/new-per-message-pricing-effective-july-1-2025).
- **Escalamiento a humano:** la política exige que la automatización ofrezca un camino a un humano descrito como "rápido, claro y directo". Según tyntec, está en la política desde 2019 y se controla con más rigor desde el 30-10-2020. Valen como caminos:
  - la transferencia en el chat;
  - un teléfono o un email;
  - el soporte web;
  - la visita al local;
  - un formulario.

  Fuente: [BSP/blog] [tyntec FAQ](https://www.tyntec.com/helpcenter/docs/faqs/whatsapp-business/your-whatsapp-account/how-will-whatsapp-enforce-human-their-escalation-policy/). No verifiqué la redacción vigente en la política oficial.
- **Si no hay escalamiento:** según fuentes secundarias, el número puede bajar a calidad "low", y si no se corrige en 7 días puede bajar más. Fuente: [BSP/blog] [tyntec](https://www.tyntec.com/helpcenter/docs/faqs/whatsapp-business/your-whatsapp-account/how-will-whatsapp-enforce-human-their-escalation-policy/).
- **Identificadores sensibles:** "Don't share or ask people to share full length individual payment card numbers, financial account numbers, personal ID card numbers, or other sensitive identifiers." Fuente: [primaria, vía fragmento de buscador] [WhatsApp Business Messaging Policy](https://business.whatsapp.com/policy); hay espejos en [Rasayel](https://learn.rasayel.io/en/books/whatsapp/whatsapp-business/whatsapp-business-messaging-policy).
- **Datos que provee WhatsApp sobre una persona:** "Don't use any data obtained from us about a person you message within WhatsApp, other than the content of message threads, for any purpose other than as reasonably necessary to support messaging with that person." Fuente: [primaria, vía fragmento] [Business Messaging Policy](https://business.whatsapp.com/policy).
- **Información entre clientes:** "You may not forward or otherwise share information from a customer chat with any other customer." Fuente: [primaria, vía fragmento] [Business Messaging Policy](https://business.whatsapp.com/policy).
- **Commerce Policy:** se aplica cuando se venden bienes o servicios con catálogos, pagos o mensajes promocionales. Prohíbe, entre otros, productos ilegales, drogas, tabaco, alcohol, armas, animales, productos para adultos y partes del cuerpo. Un negocio que vende cosas permitidas y prohibidas solo puede usar WhatsApp para las permitidas. Fuentes: [BSP/espejo] [Rasayel, Commerce Policy](https://docs.rasayel.io/whatsapp-commerce-policy) y [Gallabox](https://gallabox.com/blog/how-to-comply-with-whatsapp-commerce-policy).
- **Derecho de Meta a restringir:** si un servicio usa WhatsApp en violación de sus términos o políticas, por ejemplo mandando mensajes masivos no autorizados, Meta puede limitar o quitar el acceso. Fuente: [BSP/blog que cita la política] [SignalWire](https://signalwire.com/blog/whatsapp-business-messaging).

### Inferences

**Fase 1**
- El dueño se registra en la startup: el opt-in se obtiene en el onboarding, con un consentimiento explícito para recibir el resumen diario.
- El resumen diario cae casi siempre fuera de la ventana de 24 h. Necesita una plantilla aprobada, probablemente de categoría utility, que es paga (ver la sección 4).
- Si el dueño escribe todos los días, el resumen puede ir dentro de la ventana como mensaje de servicio, que desde el 01-10-2026 también tiene costo pasado el cupo gratis.
- Los datos de terceros que manda el dueño (nombre, teléfono, patente del cliente) viajan como *contenido* del mensaje. La política de mensajería no prohíbe recibirlos.
- El bot no debería *pedir* DNI completos ni datos de tarjeta: "personal ID card numbers" está prohibido de forma explícita.
- La patente no es un documento de identidad, pero "other sensitive identifiers" es ambiguo. No encontré ninguna aclaración.

**Fase 2**
- Si el cliente del taller inicia la conversación, el opt-in es implícito para responder dentro de la ventana.
- Los avisos proactivos ("tu auto está listo") necesitan que el taller registre el consentimiento del cliente, por ejemplo al recibir el auto.
- El bot tiene que verificar que quien pregunta es el titular, por ejemplo cruzando el teléfono con la orden. Si responde el estado del auto de otro cliente, viola "may not share information from a customer chat with any other customer" y además la ley argentina.
- Hace falta un camino visible a un humano (el dueño) y una salida automática cuando el bot no sabe.
- La Commerce Policy no parece restringir los servicios de taller. La venta de repuestos tampoco aparece en las categorías prohibidas que encontré.

### Gaps
- No pude leer la redacción vigente de la Business Messaging Policy: business.whatsapp.com estaba bloqueado. La cita textual sobre el escalamiento humano sale de un BSP, no de Meta.
- No encontré la lista oficial completa y actualizada de la Commerce Policy. Hay que verificar que no haya restricciones sobre vehículos o repuestos.

## 3. Qué provoca caídas de calidad, recortes de límites, restricciones o bans; cómo se apela; casos reales 2025-2026

### Takeaway
Meta aplica una escalera documentada:
1. advertencia;
2. bloqueo de plantillas por 1 a 3 días;
3. bloqueo de todos los mensajes por 5, 7 o 30 días;
4. bloqueo indefinido de la cuenta, que solo se levanta apelando;
5. expulsión inmediata en los casos graves.

Las apelaciones se hacen desde Business Support Home. Los disparadores típicos son los bloqueos y reportes de usuarios, los envíos masivos idénticos y los bots que se salen del tema. No encontré casos documentados y confiables de SaaS argentinos baneados en 2025-2026. El único caso argentino concreto es la salida de los asistentes generalistas (Zapia y otros) por la cláusula de IA.

### Cited Findings
- **Escalera oficial de sanciones:** advertencia, después bloqueos de 1 o 3 días para enviar plantillas de marketing, utility y authentication, después bloqueos de 5, 7 o 30 días para enviar cualquier mensaje. El bloqueo de cuenta ("account lock") es indefinido y solo se levanta con una apelación. Los casos graves (explotación infantil, estafas, terrorismo, venta de drogas) pueden terminar en expulsión inmediata. Las restricciones se ven y se apelan en Business Support Home. Fuente: [primaria] [Meta, WhatsApp Business Platform policy and spam enforcement](https://developers.facebook.com/documentation/business-messaging/whatsapp/policy-enforcement).
- **Plazos de apelación:** un BSP dice que hay 90 días para apelar. Vonage dice que la decisión suele llegar en 24 a 48 h. Otros BSP dicen que Meta no publica plazos y que algunas restricciones temporales no se pueden apelar: hay que esperar a que venzan. Las fuentes no coinciden. Fuentes: [BSP/blog] [Vonage](https://api.support.vonage.com/hc/en-us/articles/13159589787548-WhatsApp-Business-Platform-Policy-Enforcement-Review-and-Appeal-Process-for-WhatsApp-Disabled-Account), [Wati](https://support.wati.io/en/articles/15846639-how-to-appeal-a-sending-spam-restriction-for-your-whatsapp-business-account) y [Chakra](https://chakrahq.com/article/whatsapp-api-account-restricted-or-blocked-find-out-why-and-how-to-resolve).
- **Límites por portfolio:** desde octubre de 2025 (una fuente da el 07-10-2025), el límite de mensajes se aplica a todo el *business portfolio* y no a cada número. Todos los números de un portfolio comparten el límite. Fuentes: [BSP/blog] [Woztell](https://woztell.com/whatsapp-api-2026-updates-pacing-limits-usernames/) y [Chatarmin](https://chatarmin.com/en/blog/whats-app-messaging-limits).
- **Escalones:** los habituales son 250, 2.000, 10.000, 100.000 e ilimitado, en usuarios únicos por 24 h fuera de la ventana. Algunas guías de 2026 dicen que se eliminaron los escalones de 2K y 10K y que 100K pasó a ser la base tras la verificación. No hay confirmación de Meta y las fuentes se contradicen. Fuentes: [BSP/blog] [Woztell](https://woztell.com/whatsapp-api-2026-updates-pacing-limits-usernames/) y [AiSensy](https://m.aisensy.com/blog/whatsapp-message-limits-guide/).
- **Efecto de la calidad:** según fuentes secundarias, el estado "Flagged" desapareció y los límites ya no bajan solos cuando cae la calidad, pero una calidad baja impide subir de escalón. Fuente: [BSP/blog] [Chatarmin](https://chatarmin.com/en/blog/whats-app-messaging-limits). La página de ayuda de Meta sobre el rating de calidad describe reglas anteriores: [primaria, posiblemente desactualizada] [Meta Business Help](https://www.facebook.com/business/help/896873687365001).
- **Throughput:** la Cloud API soporta 80 mensajes por segundo por defecto y hasta 1.000 con una mejora automática. Fuente: [primaria, actualizada en junio de 2026] [Meta, Throughput](https://developers.facebook.com/documentation/business-messaging/whatsapp/throughput).
- **Señales que llevan a restricciones**, según un BSP argentino:
  - una tasa de bloqueos por encima de cierto umbral;
  - mensajes idénticos en serie;
  - contenido reportado como spam.

  Los síntomas son mensajes que no salen o un límite diario recortado. La suspensión dura de 24 a 72 h o es permanente. Fuente: [BSP/blog, Argentina] [Basework](https://www.basework.com.ar/blog/whatsapp-business-restringido-evitar-baneo-pyme-argentina).
- **Señales de los bots de IA:** según blogs, las caídas de calidad de 2026 golpearon a bots que generaban bloqueos o reportes por conversaciones fuera de tema. Fuente: [anecdótica/BSP] [Bunny Honey Club](https://blog.bunnyhoneyclub.com/posts/whatsapp-ai-chatbot-ban-2026-compliance).
- **Rechazo de la apelación:** un BSP dice que, si se rechaza, la única salida es registrar otro número y se pierde el acceso a la cuenta bloqueada. Fuente: [BSP/blog] resumen de [Optimify](https://optimify.ai/mi-cuenta-de-whatsapp-business-fue-bloqueada-causas-y-solucion-definitiva/). No está verificado con Meta.

### Inferences

**Fase 1 (un número, muchos dueños)**
- Las caídas de calidad dependen de cómo reaccionan los propios clientes de la startup. Son pocos y están motivados, así que el riesgo de bloqueos o reportes es bajo, salvo que el resumen diario se perciba como spam.
- Conviene hacer el resumen configurable y fácil de apagar.
- Hay un riesgo de concentración: si el número se bloquea, se cae el servicio para *todos* los talleres. Conviene tener un número de reserva verificado en otro portfolio, o un canal web de respaldo.

**Fase 2 (números de cada taller)**
- Si los números de los talleres quedan bajo el portfolio de la startup, comparten límites, y una mala práctica de un taller afecta a todos.
- Con Embedded Signup cada taller suele tener su propio portfolio, lo que aísla el riesgo. Esta es una inferencia: no está verificada para el caso concreto.

**El bot "fuera de tema" es un riesgo doble**
- Puede degradar la calidad, porque genera reportes.
- Puede llevar a que Meta lo clasifique como asistente generalista (ver la sección 1).

### Gaps
- No encontré reportes fiables (prensa o fuentes primarias) de SaaS o pymes argentinas o latinoamericanas baneadas en 2025-2026 con causa documentada. Lo que hay son blogs de BSP sin casos verificables.
- No hay umbrales numéricos públicos (porcentaje de bloqueos o reportes) que disparen las sanciones.
- La estructura vigente de escalones de mensajería en octubre de 2026 no está confirmada por Meta.

## 4. Volatilidad de la plataforma: cambios de políticas y precios 2024-2026 y sus plazos de aviso

### Takeaway
En 2025 y 2026 Meta hizo al menos seis cambios materiales. Avisó con entre 3 semanas y 3 meses, y en algunos casos los aplicó de inmediato a los usuarios nuevos. El último (01-10-2026) eliminó la gratuidad de las respuestas dentro de la ventana de 24 h y le pone costo variable al corazón conversacional de las dos fases. Al mismo tiempo, Meta compite con su propio agente de IA.

### Cited Findings
- **01-07-2025:** se pasó de cobrar por conversación a cobrar por mensaje de plantilla entregado. Las utility dentro de la ventana de atención y los mensajes sin plantilla pasaron a ser gratis. Fuentes: [primaria] [Meta, Pricing](https://developers.facebook.com/docs/whatsapp/pricing); [BSP/blog] [Gallabox](https://docs.gallabox.com/pricing-and-billing-modules/new-per-message-pricing-effective-july-1-2025).
- **Argentina, 2025:** bajaron las tarifas de utility y authentication. Wati dice que desde el 01-07-2025 y Gallabox que desde el 01-10-2025; las fuentes se contradicen. Fuentes: [BSP/blog] [Wati](https://support.wati.io/en/articles/11561662-message-based-pricing-all-you-need-to-know) y [Gallabox](https://docs.gallabox.com/pricing-and-billing-modules/new-per-message-pricing-effective-july-1-2025).
- **Octubre de 2025:** los límites de mensajería pasaron a aplicarse por portfolio. Fuente: [BSP/blog] [Woztell](https://woztell.com/whatsapp-api-2026-updates-pacing-limits-usernames/).
- **15-10-2025, cláusula AI Providers:** inmediata para los usuarios nuevos y efectiva el 15-01-2026 para los existentes, unos 3 meses de aviso. Fuentes: [prensa] [TechCrunch, 18-10-2025](https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform/); [BSP/blog] [learnmind.ai](https://www.learnmind.ai/blog-post/whatsapp-business-ai-chatbot-2026-policy-guide).
- **Enero a marzo de 2026, excepciones y tarifas por país** (ver la sección 1):
  - Italia (+39), con tarifa para AI Providers desde el 16-02-2026, unas 3 semanas de aviso;
  - Brasil (+55);
  - EEE, con tarifa desde el 04/05-03-2026.

  Fuentes: [prensa] [TechCrunch, 15-01-2026](https://techcrunch.com/2026/01/15/after-italy-whatsapp-excludes-brazil-from-rival-chatbot-ban) y [TechCrunch, 05-03-2026](https://techcrunch.com/2026/03/05/meta-will-allow-rival-ai-chatbots-on-whatsapp-in-europe-but-for-a-fee/).
- **2026, usernames y BSUID:** según BSP, Meta está desplegando usernames e identificadores de usuario por empresa (BSUID), que podrían ocultar el número de teléfono en los webhooks. Fuentes: [BSP/blog] [Woztell](https://woztell.com/whatsapp-api-2026-updates-pacing-limits-usernames/) y [Sanuker](https://sanuker.com/whatsapp-api-2026_updates-pacing-limits-usernames/). No verifiqué el changelog oficial.
- **03-06-2026:** Meta lanzó Meta Business Agent, "gratis para empezar". Lo factura por tokens (unos US$2 por millón) desde el 01-08-2026 y desde septiembre lo vende en planes pagos. Fuentes: [primaria] [WhatsApp Business blog](https://whatsappbusiness.com/blog/introducing-meta-business-agent-ai/); [prensa] [Tech Times](https://www.techtimes.com/articles/320787/20260716/meta-business-agent-billing-starts-aug-1-free-test-window-ends-days.htm).
- **01-10-2026, anunciado el 01-07-2026 (3 meses de aviso):**
  - los mensajes de servicio sin plantilla dentro de la ventana de 24 h, escritos por una persona o generados por una IA de terceros, dejan de ser gratis;
  - pagan lo mismo que utility y authentication en cada mercado, sin escalones por volumen;
  - las utility enviadas dentro de la ventana también se cobran;
  - las tarifas definitivas se publicaron el 01-09-2026.

  Fuente: [primaria] [Meta, "Upcoming pricing updates for Meta Business Agent, service and utility messages"](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages).
- **Cupo gratuito desde el 01-10-2026:** la mayoría de los BSP hablan de 1.000 mensajes de servicio gratis por número y por mes, sin acumulación. Wati describe que no hay cupo. Las ventanas de 72 h abiertas por anuncios Click-to-WhatsApp siguen gratis. Fuentes: [BSP/blog] [Wawcd](https://wawcd.com/blog/whatsapp-pricing-change-october-2026), [Zenvia](https://zenvia.com/en/new-whatsapp-business-pricing-rules-for-2026/), [Wati](https://support.wati.io/en/articles/16954666-whatsapp-business-platform-api-pricing-changes-service-messages-and-click-to-message-ads) y [Techweez, 28-09-2026](https://techweez.com/2026/09/28/whatsapp-business-pricing-october-2026/).
- **09-06-2026:** medidas cautelares de la UE que obligan a Meta a revertir la política en el EEE. Muestra que las reglas pueden cambiar por intervención regulatoria y quedar distintas en cada jurisdicción. Fuente: [prensa] [EU Perspectives](https://euperspectives.eu/2026/06/commission-gives-meta-five-days-to-open-whatsapp-ai-to-competition/).

### Inferences
- **Patrón:** Meta avisa con unos 3 meses los cambios grandes de términos y precios. Los ajustes por país o los que impone un regulador llegan con semanas de aviso, y los usuarios nuevos pueden quedar sujetos de inmediato. Un plan de negocio en WhatsApp tiene que tolerar un cambio material por semestre.
- **Costo:** desde el 01-10-2026, cada respuesta del bot o del LLM pasado el cupo gratuito (si existe) tiene costo, igual que una utility en Argentina.
  - En la fase 1, un dueño que manda 20 o 30 audios por día genera *respuestas* de confirmación que consumen el cupo de 1.000 por número rápido, porque el cupo es por número y no por cliente. Con un solo número para todos los talleres, se agota con pocos clientes activos.
  - Hay que modelar el costo por taller y por mes con la tarifa utility argentina y agrupar confirmaciones (por ejemplo, una respuesta por lote).
  - En la fase 2, el cupo es por número de taller, lo que favorece la arquitectura de un número por taller.
- **Competencia de Meta:** Meta Business Agent apunta a la atención al cliente, que es la fase 2. Meta controla a la vez el canal, el precio y el producto competidor.
- **Identificación de clientes:** si los BSUID reemplazan al teléfono, la fase 2 no podrá basarse solo en el número para identificar al cliente del taller y saber "¿está listo mi auto?". Conviene diseñar la identificación de forma que no dependa del teléfono.

### Gaps
- No confirmé el plazo de aviso del cambio del 01-07-2025 (cuándo se anunció el cobro por mensaje).
- No obtuve las tarifas oficiales de Argentina vigentes en octubre de 2026 (utility y servicio). Hay que leer el rate card de Meta.
- No confirmé si el cupo de 1.000 mensajes de servicio existe, ni si es por número o por portfolio: las fuentes secundarias se contradicen.

## 5. Ángulo argentino de protección de datos (Ley 25.326, AAIP): guardar datos de terceros recibidos por WhatsApp

### Takeaway
Los datos de los clientes del taller (nombre, teléfono, patente, presupuesto) son datos personales bajo la Ley 25.326. El taller es el responsable de la base y la startup actúa como prestadora de servicios de tratamiento por cuenta de terceros (art. 25). Eso exige:
- una base legal: consentimiento o la excepción por relación contractual;
- inscribir la base en el Registro de la AAIP;
- un contrato de encargo que limite el uso;
- resguardo en las transferencias internacionales hacia el LLM y la nube.

### Cited Findings
- **Consentimiento:** la ley exige consentimiento libre, expreso e informado (art. 5); sin él, el tratamiento es ilícito. Las excepciones del art. 5.2 incluyen:
  - datos que surgen de una relación contractual y son necesarios para cumplirla;
  - listados limitados a nombre, DNI, CUIT, ocupación, fecha de nacimiento y domicilio.

  Fuente: [primaria] [Ley 25.326, texto vía OEA](https://www.oas.org/juridico/pdfs/arg_ley25326.pdf). El detalle del art. 5.2 viene de mi conocimiento previo del texto legal; no lo releí en esta sesión.
- **Cesión a terceros:** requiere el consentimiento previo del titular, informado sobre la finalidad (art. 11). Los datos sensibles exigen consentimiento expreso. Fuentes: [primaria] [Ley 25.326](https://www.oas.org/juridico/pdfs/arg_ley25326.pdf); [estudio jurídico] [Nunes & Asociados](https://estudionunes.com.ar/proteccion-de-datos-sensibles-lo-que-las-empresas-deben-saber/).
- **Inscripción:** el art. 21 obliga a inscribir las bases en el Registro Nacional de Bases de Datos Personales de la AAIP, por Trámites a Distancia. Fuente: [estudio jurídico] [JBB Abogados](https://jbbabogados.com.ar/registro-de-bases-de-datos-personales-en-argentina-cuando-corresponde-inscribirlas-ante-la-aaip-y-como-hacerlo/).
- **Bases que alimentan IA:** la guía preliminar de la AAIP indica que las bases que alimentan sistemas de IA, públicos o privados, deben estar inscriptas. Fuente: [primaria, preliminar] [Guía AAIP, versión preliminar](https://www.pensamientopenal.com.ar/system/files/Documento2095.pdf).
- **Programa y guía de IA:** la AAIP creó el "Programa de Transparencia y Protección de Datos Personales en el uso de la IA" (Resolución 161/2023) y publicó en septiembre de 2024 una guía para el uso responsable de la IA. Fuentes: [primaria] [argentina.gob.ar](https://www.argentina.gob.ar/noticias/programa-de-transparencia-y-proteccion-de-datos-personales-en-el-uso-de-la-inteligencia) y [argentina.gob.ar, guía](https://www.argentina.gob.ar/noticias/guia-de-la-aaip-para-usar-la-inteligencia-artificial-de-manera-responsable); [estudio jurídico] [Beccar Varela](https://beccarvarela.com/novedades/alerta-normativa-guia-de-la-aaip-para-entidades-publicas-y-privadas-en-materia-de-transparencia-y-proteccion-de-datos-personales-para-una-inteligencia-artificial-responsable/).
- **Transferencias internacionales:** la ley las restringe hacia países sin protección adecuada. Un análisis de 2026 dice que la Ley 25.326 sigue vigente y que la reforma busca actualizarla, no reemplazarla. No hay una ley nueva aprobada. Fuente: [prensa jurídica] [Diario Judicial, 2026](https://www.diariojudicial.com/news-103126-proteccion-de-datos-personales-sigue-siendo-suficiente-la-ley-25326-en-2026).
- **Sanciones de la AAIP:** apercibimiento, multas y, en casos extremos, la clausura de la base. Fuente: [estudio jurídico] [Nunes & Asociados](https://estudionunes.com.ar/proteccion-de-datos-sensibles-lo-que-las-empresas-deben-saber/).

### Inferences
- **Roles:** el taller es el responsable de los datos de sus clientes. La startup es la prestadora de servicios informatizados (art. 25). Por eso, los datos solo se usan para el servicio contratado, no se ceden y se destruyen o devuelven al terminar el contrato. Esto encaja con la restricción de Meta sobre no entrenar con Business Solution Data.
- **Base legal:** la relación contractual taller-cliente (la reparación) probablemente cubre registrar nombre, teléfono, patente y presupuesto *para prestar el servicio*. Esta interpretación necesita validación legal.
- **Avisos proactivos y usos secundarios:** los avisos de la fase 2 y cualquier uso secundario (marketing, analítica entre talleres) piden un consentimiento informado.
- **Transferencia a EE. UU.:** mandar los datos a un LLM y a una nube en EE. UU. es una transferencia internacional. Hacen falta cláusulas contractuales o un consentimiento.
- **Inscripción y privacidad:** conviene inscribir la base ante la AAIP y publicar una política de privacidad que nombre a los subencargados (Meta/WhatsApp, el proveedor de LLM, el hosting).
- **DNI:** la Ley 25.326 y la política de Meta (no pedir "personal ID card numbers") coinciden en que el bot no debería pedir DNI.

### Gaps
- No encontré pronunciamientos de la AAIP sobre WhatsApp Business ni sobre chatbots en 2025-2026.
- No verifiqué en esta sesión el estado del proyecto de reforma de la ley ni si Argentina adhirió a un régimen de cláusulas modelo actualizado.
- No hay un análisis jurídico específico sobre si la patente (dominio) es un dato personal en este contexto. Probablemente lo sea si se asocia a una persona identificable, pero hace falta asesoramiento legal.
