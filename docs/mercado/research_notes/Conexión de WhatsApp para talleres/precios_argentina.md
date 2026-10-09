# Precios de WhatsApp Business Platform en Argentina (octubre de 2026) para un SaaS chico

Notas de investigación al 2026-10-09.

**Limitación de método.** En este entorno, el proxy de salida bloqueó la descarga directa de todas las páginas: developers.facebook.com, business.whatsapp.com, argentina.gob.ar y los blogs de los BSP. Todo lo que sigue sale de los resúmenes y fragmentos que devolvió el buscador web, no de una lectura completa de cada página. Cuando el dato viene de una página de Meta, lo marco **[Meta, vía fragmento de búsqueda]**. Cuando viene de un BSP o de un blog, lo marco **[secundaria]**. Ninguna tarifa de Argentina pudo verificarse contra el CSV o el PDF oficial de Meta, así que **todas las tarifas en USD y en ARS de estas notas son "no verificadas contra la fuente primaria"**. Las cifras en las que coinciden varias fuentes secundarias independientes se señalan como "consenso".

## 1. ¿Cómo funciona el modelo de precio por mensaje de Meta: qué se cobra, qué es gratis, la ventana de 24 h y los tramos de volumen?

### Takeaway
Desde el 1 de julio de 2025, Meta cobra por cada mensaje entregado según su categoría: marketing, utility y authentication. Los mensajes entrantes no se cobran. **El cambio que más pesa para este caso entró en vigencia el 1 de octubre de 2026, ocho días antes de estas notas.** Desde esa fecha, los mensajes de servicio (respuestas de texto libre dentro de la ventana de 24 h) y los templates utility enviados dentro de la ventana dejaron de ser gratis. Los mensajes de servicio tienen una franquicia de 1.000 gratis por mes **por número de teléfono del negocio**; los utility no tienen franquicia. Lo único que sigue gratis es la ventana de 72 h de los puntos de entrada gratuitos (anuncios Click-to-WhatsApp y el botón de la página de Facebook).

### Cited Findings

**Modelo general (desde el 1-jul-2025)**
- Se cobra por mensaje entregado, no por conversación. Cada template se cobra según su categoría. El modelo de conversaciones quedó marcado como "Deprecated" en la documentación de Meta. — [Meta: Conversation-based pricing (Deprecated)](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/conversation-based-pricing) [Meta, vía fragmento de búsqueda]; [respond.io: WhatsApp Pricing](https://respond.io/help/whatsapp/whatsapp-pricing) [secundaria]
- Los mensajes entrantes y los no entregados no se cobran: Meta factura solo lo que el negocio entrega al usuario. — [Blueticks: WhatsApp Business API Pricing 2026](https://blueticks.co/blog/whatsapp-business-api-pricing-2026) [secundaria]
- La tarifa depende del país del destinatario (código +54 para Argentina), no del país del negocio. — [Zernio: WhatsApp Business API Pricing](https://zernio.com/blog/whatsapp-business-api-pricing) [secundaria]; [Meta: Pricing on the WhatsApp Business Platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) ("Argentina (AR) - 54") [Meta, vía fragmento de búsqueda]
- Los templates de marketing se cobran siempre, aunque la ventana de servicio esté abierta. Solo la ventana de punto de entrada gratuito los exime. — [respond.io: WhatsApp Pricing](https://respond.io/help/whatsapp/whatsapp-pricing) [secundaria]
- Los templates de authentication se cobran incluso dentro de la ventana de 24 h. — [respond.io: WhatsApp Pricing](https://respond.io/help/whatsapp/whatsapp-pricing) [secundaria]; [Chat2Desk: WhatsApp Business API Pricing Changes October 2026](https://chat2desk.com/en/blog/articles/whatsapp-business-api-billing-to-change) [secundaria]

**Ventana de atención al cliente (customer service window, CSW)**
- Se abre cuando el usuario escribe y dura 24 h desde su **último** mensaje: cada mensaje nuevo del usuario la reinicia. — [respond.io: WhatsApp Pricing Change 2026](https://respond.io/blog/whatsapp-pricing-change-2026) [secundaria]
- Los mensajes que no son template (texto libre, audio, imagen) solo se pueden mandar con la ventana abierta. Fuera de ella, solo templates aprobados. — [Kyrios Systems: Managing WhatsApp Conversations](https://help.kyriossystems.com/en/articles/13678362-managing-whatsapp-conversations-categories-pricing-service-windows-and-free-entry-points) [secundaria]
- El cambio de octubre de 2026 modifica solo la facturación. La ventana se abre y se reinicia igual que antes. — [Wati: WhatsApp Service Message Pricing Changes](https://www.wati.io/en/blog/whatsapp-service-message-pricing/) [secundaria]

**Hasta el 30-sep-2026 (régimen vigente entre jul-2025 y sep-2026)**
- Los mensajes de servicio fueron gratis desde el 1-nov-2024. — [Meta: Upcoming pricing updates for Meta Business Agent, service and utility messages](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages) [Meta, vía fragmento de búsqueda]
- Los templates utility eran gratis dentro de la ventana de 24 h y se cobraban por mensaje fuera de ella. — [respond.io: WhatsApp Pricing](https://respond.io/help/whatsapp/whatsapp-pricing) [secundaria]; [SendPulse: WhatsApp Service Message Pricing Changes in October 2026](https://sendpulse.com/blog/whatsapp-service-message-pricing) [secundaria]

**Desde el 1-oct-2026 (régimen vigente hoy)**
- Meta cobra por mensaje todos los mensajes de servicio y también los templates utility enviados dentro de la ventana. — [Meta: Upcoming pricing updates…](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages) [Meta, vía fragmento de búsqueda]
- Los mensajes de servicio se cobran a la misma tarifa que utility y authentication en cada mercado. — [Zernio: WhatsApp Business API Pricing](https://zernio.com/blog/whatsapp-business-api-pricing) [secundaria]; [Flowcall: WhatsApp Business API Pricing (Oct 2026)](https://www.flowcall.co/blog/whatsapp-business-api-pricing) [secundaria]
- **Franquicia:** 1.000 mensajes de servicio gratis por mes **por número de teléfono del negocio**. Se cobra desde el 1.001, no se acumula al mes siguiente y se cuenta por mensaje, no por conversación: cinco respuestas son cinco mensajes. — [Chat2Desk](https://chat2desk.com/en/blog/articles/whatsapp-business-api-billing-to-change); [respond.io: WhatsApp Pricing Change 2026](https://respond.io/blog/whatsapp-pricing-change-2026); [Wati](https://www.wati.io/en/blog/whatsapp-service-message-pricing/); [Messangi](https://www.messangi.com/whatsapp-business-whatsapp-business-pricing-updates-2026/) [todas secundarias]
  - La búsqueda no mostró el número "1.000" en un fragmento de la página de Meta. Aparece en muchos BSP, de forma consistente. Hay que confirmarlo en la página de Meta.
- La franquicia de 1.000 cubre solo mensajes de servicio, no templates utility: un utility se cobra aunque queden mensajes de servicio gratis. — [Wati](https://www.wati.io/en/blog/whatsapp-service-message-pricing/); [respond.io](https://respond.io/help/whatsapp/whatsapp-pricing) [secundarias]
- Un mensaje de servicio enviado a un grupo cuenta una vez por cada destinatario. — fuente única, [Messangi](https://www.messangi.com/whatsapp-business-whatsapp-business-pricing-updates-2026/) [secundaria, verificar]
- **Medio de pago:** hay dos versiones.
  - Una fuente dice que, si el BSP o el negocio integrado directo no tenía un medio de pago cargado al 30-sep-2026, deja de entregar mensajes de servicio desde el 1-oct.
  - Otra dice que sin medio de pago se siguen entregando hasta agotar los 1.000 gratis.
  - Fuentes: [ChatMaxima](https://chatmaxima.com/blog/whatsapp-service-message-pricing-october-2026/); [YCloud](https://www.ycloud.com/blog/whatsapp-api-message-pricing-update-effective-october-1-2026) [secundarias, en conflicto]
- **Meta Business Agent** (el agente de IA de Meta): USD 2,00 por millón de tokens de entrada más salida desde el 1-ago-2026, además del cargo por mensaje. Solo aplica si se usa el agente de Meta, no una IA propia conectada por la API. — [Zernio: Meta Business Agent Pricing](https://zernio.com/blog/meta-business-agent-pricing); [SleekFlow](https://sleekflow.io/en-sg/blog/meta-business-agent-pricing-changes-2026); [TechTimes](https://www.techtimes.com/articles/320787/20260716/meta-business-agent-billing-starts-aug-1-free-test-window-ends-days.htm) [secundarias]

**Punto de entrada gratuito (Free Entry Point, FEP)**
- Se abre cuando un usuario de Android o iOS escribe desde un anuncio Click-to-WhatsApp o desde el botón CTA de una página de Facebook, y el negocio responde dentro de las 24 h. Dura 72 h y en ese lapso todos los mensajes, templates incluidos, son gratis. — [Mastermind KB: Free Entry Point Conversations](https://mastermind.helpscoutdocs.com/article/1222-managing-whatsapp-conversations-a-guide-to-categories-duration-and-free-entry-point-conversations) [secundaria]
- Sigue vigente después del 1-oct-2026. — [Wati](https://www.wati.io/en/blog/whatsapp-service-message-pricing/) [secundaria]
- Una fuente dice que la ventana de los anuncios pasó a 7 días. No está confirmado y otra lo contradice. — resumen del buscador sobre [EngageLab](https://www.engagelab.com/blog/whatsapp-business-api-pricing) [secundaria, no verificada]

**Tramos de volumen**
- Desde el 1-jul-2025 hay descuentos por volumen solo para utility y authentication; marketing no tiene. — [Blueticks](https://blueticks.co/blog/whatsapp-business-api-pricing-2026) [secundaria]
- Funcionamiento:
  - cada mercado y cada categoría tiene sus propios tramos;
  - el conteo vuelve a cero cada mes calendario;
  - se suman todos los WABA de un mismo business portfolio;
  - el descuento es marginal: la tarifa de cada tramo se aplica solo a los mensajes dentro de ese tramo;
  - solo cuentan los mensajes cobrados.
  
  Fuentes: [Meta: Pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) ("Tiers are market–category specific") [Meta, vía fragmento de búsqueda]; [Blueticks](https://blueticks.co/blog/whatsapp-business-api-pricing-2026) [secundaria]
- Los mensajes de servicio no tienen descuento por volumen. — [DMLY: Volume Tiers on WhatsApp: No Discount for Service Messages](https://dmly.io/whatsapp-service-message-volume-tiers/) [secundaria]
- Desde el 1-oct-2026, nueve mercados pasan a tener tarifas y tramos propios. No confirmé si Argentina es uno de ellos. — [HighLevel: WhatsApp Pricing, Billing & Rebilling Guide](https://help.gohighlevel.com/support/solutions/articles/155000001428-whatsapp-pricing-billing-and-rebilling-guide) [secundaria]
- Meta exige al menos un mes de aviso para cambiar la tarifa de un par mercado–categoría. — [Meta: Pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) [Meta, vía fragmento de búsqueda]

### Inferences
- Para un SaaS que conversa con dueños de talleres, la franquicia de 1.000 mensajes de servicio es **por número**, no por cliente. En la fase 1, todos los talleres escriben al número de la startup y comparten esa misma franquicia, que se agota con 4 o 5 talleres activos (ver la sección 5).
- En la fase 2, cada taller tiene su propio número y, por lo tanto, su propia franquicia de 1.000. A esa escala, casi siempre alcanza.
- Desde el 1-oct-2026, "mantener la ventana abierta" ya no ahorra dinero en utility. Solo sirve para poder mandar texto libre, que entra en la franquicia de servicio, y para el FEP.
- El precio no distingue entre texto, audio o imagen: se cobra por mensaje. Lo infiero de que todas las fuentes hablan de "per delivered message" sin distinguir el tipo de contenido. No encontré una cita explícita.
- No encontré el texto de Meta que lo diga, pero es la regla conocida: un template que manda el negocio **no abre** la ventana de atención. La ventana se abre solo cuando el usuario escribe o responde. Hay que verificarlo en la página de Meta.

### Gaps
- No pude leer la página de Meta sobre mensajes que no son template (`/pricing/non-template-messages`) completa. Quedan por confirmar en la fuente primaria la cifra de 1.000, si es por número o por WABA, y la regla del medio de pago.
- Duración actual de la ventana FEP de los anuncios: 72 h o 7 días. Las fuentes no coinciden.

## 2. ¿Cuáles son las tarifas actuales para Argentina (+54) y cómo cambiaron en 2025-2026?

### Takeaway
Hay consenso entre varias fuentes secundarias en la tarifa de lista de Meta para Argentina en USD, para las tarjetas de tarifas del 1-jul-2026 y del 1-oct-2026: **marketing USD 0,0618; utility USD 0,0260; authentication USD 0,0260; servicio USD 0,0260** (este último desde el 1-oct-2026, pasados los 1.000 gratis). En ARS, según tres fuentes secundarias de la tarjeta del 1-oct-2026, **marketing ARS 89,562 y utility, authentication y servicio ARS 37,6798**. Esas cifras equivalen exactamente a las de USD convertidas a unos 1.449,2 ARS/USD. Ninguna cifra pudo verificarse contra el CSV oficial. Las tablas que muestran USD 0,0711 y 0,0299 son, con alta probabilidad, precios de BSP con recargo.

### Cited Findings

**Tarifa de lista de Meta (consenso, no verificada contra el CSV de Meta)**
- Argentina: marketing USD 0,0618; utility USD 0,0260; authentication USD 0,0260. — [Zernio: WhatsApp API Pricing Calculator (October 2026 rates)](https://zernio.com/whatsapp-api-pricing) [secundaria]; [Whatsetter](https://www.whatsetter.com/tools/whatsapp-api-pricing-calculator) [secundaria]; [Flowcall](https://www.flowcall.co/blog/whatsapp-business-api-pricing) [secundaria]
- Una fuente indica que la tarjeta rige desde el 2026-07-01 y que la verificó el 2026-08-13 contra la tarjeta oficial de Meta. Da authentication doméstica a USD 0,0260 en el tramo inicial. — [Srileo: Authentication WhatsApp Rate: Argentina](https://srileo.com/tools/whatsapp-api-pricing-calculator/argentina/authentication/) [secundaria]
- Marketing aparece a USD 0,0618 en la mayoría de los agregadores, que dicen tomarlo "de la tarjeta de Meta vigente desde el 1 de julio de 2026". LandinChat muestra USD 0,0617. — [Ominiflow: Argentina](https://ominiflow.com/whatsapp-api-pricing/argentina); [LandinChat](https://landinchat.com/whatsapp-pricing) [secundarias]
- Servicio en Argentina desde el 1-oct-2026: USD 0,0260. — [ManyChat: WhatsApp pricing guide](https://help.manychat.com/hc/en-us/articles/14281380243740-WhatsApp-pricing-guide); [Zernio](https://zernio.com/whatsapp-api-pricing) [secundarias]

**Tarjeta en ARS (secundaria, no verificada)**
- Tarjeta ARS de Argentina: marketing ARS 89,562; utility ARS 37,6798; equivalentes en USD de 0,0618 y 0,026. — [Flowcall](https://www.flowcall.co/blog/whatsapp-business-api-pricing) [secundaria]
- ARS 89,56 por marketing y ARS 37,68 por utility y authentication fuera de la ventana. Según esta fuente, los equivalentes en dólares que circulan salen de convertir esos valores. — [Basework: WhatsApp Marketing en Argentina 2026](https://www.basework.com.ar/blog/whatsapp-marketing-argentina-2026); [Niveals: Cuánto cuesta enviar mensajes por WhatsApp en Argentina](https://niveals.com/blog/cuanto-cuesta-enviar-mensajes-whatsapp-argentina) [secundarias]
- Desde octubre, cada respuesta de servicio dentro de la ventana cuesta lo mismo que un utility, unos ARS 37,68 en Argentina. — resumen del buscador sobre [Niveals](https://niveals.com/blog/cuanto-cuesta-enviar-mensajes-whatsapp-argentina) [secundaria]

**Cifras en conflicto (probables precios de BSP o tablas viejas)**
- SleekFlow: Argentina marketing USD 0,07107; utility y authentication USD 0,02990, "vigente hasta el 30-sep-2026". Su tabla del 1-oct-2026 repite 0,02990 para utility y pone servicio a 0,0260. — [SleekFlow Help: WhatsApp Business API Pricing](https://help.sleekflow.io/en_US/whatsapp/pricing); [SleekFlow blog](https://sleekflow.io/blog/whatsapp-business-price) [secundarias, BSP]
- ManyChat: marketing USD 0,0710; utility USD 0,0299; servicio USD 0,0260 desde el 1-oct. — [ManyChat](https://help.manychat.com/hc/en-us/articles/14281380243740-WhatsApp-pricing-guide) [secundaria, BSP]
- Gallabox: USD 0,0711 y 0,0299. Su columna en ARS (5,2087 y 2,1921) no cuadra con ninguna otra fuente. — [Gallabox: WhatsApp Rate Card](https://docs.gallabox.com/pricing-and-billing/whatsapp-pricing/rate-card) [secundaria, BSP]
- HighLevel: marketing USD 0,0649; utility USD 0,0273. — [HighLevel](https://help.gohighlevel.com/support/solutions/articles/155000001428-whatsapp-pricing-billing-and-rebilling-guide) [secundaria, BSP]
- Otras cifras que no cuadran con ninguna de las anteriores:
  - LandinChat: utility USD 0,0212 y authentication USD 0,0500.
  - Whapi: utility USD 0,0380 y authentication USD 0,0360.
  - Ominiflow: utility USD 0,0120 y authentication USD 0,0220, que la misma fuente califica de "indicativas".
  
  Fuentes: [LandinChat](https://landinchat.com/whatsapp-pricing); [Whapi](https://usewhapi.com/whatsapp-api-pricing/); [Ominiflow](https://ominiflow.com/whatsapp-api-pricing/argentina) [secundarias, de baja confiabilidad]
- Tarifas en EUR para Argentina: marketing €0,0512; utility y authentication €0,0216. — resumen del buscador, fuente no identificada con precisión [no verificada]

**Cambios de tarifa de Argentina en 2025-2026**
- 1-jul-2025: pasa a regir el precio por mensaje. Un fragmento de la página de Meta lista para Argentina, utility y authentication, un cambio "Lower" con fecha 1-jul-2025. — [Meta: Pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) [Meta, vía fragmento de búsqueda]
- 1-oct-2025: la tabla de cambios de Meta lista Argentina / Utility y Authentication / 1-oct-2025 / "Lower", sin el valor nuevo. En ese ciclo hubo, en cuatro mercados, una suba y tres bajas para utility y authentication. Wati lo confirma: "Utility and Authentication message rates will decrease for Saudi Arabia, Argentina, and Egypt". — [Meta: Pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) [Meta, vía fragmento de búsqueda]; [Wati: Message-Based Pricing](https://support.wati.io/en/articles/11561662-message-based-pricing-all-you-need-to-know) [secundaria]
  - Los fragmentos atribuyen la baja de Argentina al 1-jul-2025 en una búsqueda y al 1-oct-2025 en otra. Puede que hubiera dos bajas o que sea un error del resumen.
- 1-abr-2026: se suma ARS como moneda de facturación (ver la sección 3).
- El changelog de Meta registra que la página de precios se actualizó con las tarjetas del 1-jul-2026 y del 1-oct-2026, en 16 monedas. — [Meta: WhatsApp changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog) [Meta, vía fragmento de búsqueda]
- 1-oct-2026: se empiezan a cobrar los mensajes de servicio y los utility dentro de la ventana. Argentina mantiene, según los agregadores, 0,0618 y 0,026 en USD. — [Flowcall](https://www.flowcall.co/blog/whatsapp-business-api-pricing); [Zernio](https://zernio.com/whatsapp-api-pricing) [secundarias]

**Tramos de volumen de Argentina**
- Authentication doméstica, tramos que reproduzco leyendo las cifras de la fuente con separador de miles estándar (la fuente usa la notación india, p. ej. "1,20,001"):

  | Mensajes por mes | USD por mensaje |
  |---|---|
  | 0 a 120.000 | 0,0260 |
  | 120.001 a 400.000 | 0,0247 |
  | 400.001 a 1.000.000 | 0,0234 |
  | 1.000.001 a 5.000.000 | 0,0221 |
  | 5.000.001 a 10.000.000 | 0,0208 |
  | más de 10.000.000 | 0,0195 |

  — [Srileo](https://srileo.com/tools/whatsapp-api-pricing-calculator/argentina/authentication/) [secundaria, no verificada]
- No encontré los tramos de utility para Argentina.

### Inferences
- Lo más probable es que las cifras de SleekFlow, ManyChat y Gallabox (0,0711 y 0,0299) sean la tarifa de Meta con un recargo del 15%: 0,0711 / 0,0618 = 1,150 y 0,0299 / 0,026 = 1,150. Las de HighLevel (0,0649 y 0,0273) serían un recargo del 5%. No es un dato publicado por esos BSP; lo deduzco del cociente constante.
- En la tarjeta del 1-oct-2026, la ARS sale de la USD multiplicada por unos 1.449,2: 89,562 / 0,0618 = 1.449,2 y 37,6798 / 0,026 = 1.449,2. Meta fijó el valor en pesos con un tipo de cambio de referencia y no lo ajusta día a día.
- Para presupuestar, uso utility = authentication = servicio = USD 0,026 (ARS 37,68) y marketing = USD 0,0618 (ARS 89,56). Valen para la tarjeta del 1-oct-2026, sin verificar contra el CSV de Meta.
- Ningún taller va a llegar al primer tramo de descuento. Con 120.000 authentication por mes como umbral, ni la startup completa llega en las fases 1 y 2.

### Gaps
- El CSV y el PDF oficiales de Meta para Argentina, en USD y en ARS, no se pudieron descargar: el proxy bloquea developers.facebook.com.
- Los valores de utility y authentication de Argentina antes y después de la baja de oct-2025, y si hubo una baja también en jul-2025.
- Los tramos de utility para Argentina, y si Argentina está entre los nueve mercados que pasan a tramos propios el 1-oct-2026.
- Si la tarifa de servicio de Argentina desde el 1-oct-2026 es exactamente USD 0,026 en la fuente primaria. Las fuentes secundarias coinciden.

## 3. ¿Cómo funciona la facturación en ARS, qué medios de pago hay y qué impuestos argentinos cambian el costo efectivo?

### Takeaway
Desde el 1-abr-2026, Meta ofrece ARS como moneda de facturación, con su propia tarjeta de tarifas en pesos. La moneda se elige al crear el WABA y no se puede cambiar después: para pasar a pesos hace falta un WABA nuevo. La tarjeta en ARS equivale a la de USD convertida a un tipo de cambio fijo de unos 1.449 ARS/USD, así que no es más barata en sí. El costo efectivo depende sobre todo de los impuestos al pagar a un prestador del exterior:
- IVA 21% (RG 4240 para quien no es responsable inscripto);
- percepción de Ganancias y Bienes Personales del 30% (RG 5617/2024), que según la cobertura de mediados de 2026 **sigue vigente** para servicios de no residentes, aunque hubo notas de enero que anunciaron su eliminación;
- percepción de IIBB del 2-3%, según la provincia.

Para un monotributista, el recargo llega a cerca del 53%. Para una sociedad responsable inscripta, la mayor parte se recupera (el IVA como crédito fiscal y el 30% como pago a cuenta), pero el efectivo sale igual al momento del pago.

### Cited Findings

**ARS como moneda de facturación**
- "Effective April 1, 2026 – 8 new billing currencies introduced: AED (United Arab Emirates), ARS (Argentina), CLP (Chile), COP (Colombia), MYR (Malaysia), PEN (Peru), SAR (Saudi Arabia), SGD (Singapore)." — [Meta: Calling API Pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/pricing) [Meta, vía fragmento de búsqueda]
- La página de precios de Meta lista ARS con su propio CSV y PDF de tarifas y tramos de volumen, y dice que las tarjetas reflejan las tarifas vigentes desde el 1-oct-2026. — [Meta: Pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) [Meta, vía fragmento de búsqueda]
- Para usar una moneda nueva hay que crear un WABA nuevo y elegirla. La moneda de un WABA existente no se puede cambiar. — resumen del buscador sobre [Meta: Pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing) [Meta, vía fragmento de búsqueda]
- Hay 16 monedas de facturación (USD, AED, ARS, AUD, BRL, CLP, COP, EUR, GBP, IDR, INR, MXN, MYR, PEN, SAR, SGD). Cada tarjeta se fija por separado y la tarifa en moneda local no sigue al tipo de cambio: cambia solo cuando Meta publica una tarjeta nueva. — [WhAutomate: WhatsApp API Pricing 2026](https://whautomate.com/whatsapp-business-api-pricing); [Meta: WhatsApp changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog) (las 16 monedas) [secundaria y Meta vía fragmento]
- Un usuario reporta que desde 2026 Meta crea por defecto los WABA nuevos de Chile y otros países de LatAm en moneda local (CLP, ARS, COP). Agrega que ManyChat solo puede compartir su línea de crédito en USD con WABA en USD. — [ManyChat Community: support WABAs in local currencies](https://community.manychat.com/ideas/support-whatsapp-business-accounts-waba-in-local-currencies-clp-ars-cop-or-allow-the-client-s-own-payment-method-10944) [secundaria, reporte de usuario; según la página de Meta, la moneda se elige al crear la cuenta]

**Impuestos y percepciones al pagar servicios digitales del exterior (2026)**
- **IVA 21% sobre servicios digitales del exterior** (Ley 27.430; RG 4240/2018).
  - El régimen de percepción alcanza a los prestatarios que **no** son responsables inscriptos en IVA.
  - La percepción la hace el intermediario local, por ejemplo el emisor de la tarjeta, si el prestador figura en el Anexo II.
  - Con tarjeta, se percibe en la fecha de cobro del resumen.
  
  — [ARCA (AFIP): Régimen de percepción RG 4240](https://www.afip.gob.ar/iva/servicios-digitales/reg-percepcion-4240.asp) [oficial, vía fragmento de búsqueda]; [Estudio Piacentini](https://www.estudiopiacentini.com.ar/impuestos-que-se-pagan-sobre-los-servicios-digitales-del-exterior/) [secundaria]
- Para un responsable inscripto, el IVA de un servicio digital del exterior es crédito fiscal recuperable. Para un monotributista o un consumidor final, el IVA y los IIBB son costo definitivo. — [DoubleTick: Impuestos Meta Ads con tarjeta 2026](https://www.doubletick.com.ar/blog/impuestos-meta-ads-tarjeta-credito-argentina-2026/) [secundaria, interés comercial: vende líneas de crédito para pauta]; [Contablix: Facturas META y servicios del exterior](https://contablix.ar/blog/iva-meta-ganancias-2025-retencion-argentina) [secundaria]
- **Percepción del 30% a cuenta de Ganancias y Bienes Personales** (RG 5617/2024, la que reemplazó el esquema del impuesto PAIS, que terminó el 23-dic-2024).
  - Según El Cronista, ARCA eliminó las percepciones sobre la compra de moneda extranjera, pero **no** el "dólar tarjeta". La percepción sigue para las compras con tarjeta en el exterior y para los servicios de empresas no residentes, como streaming y software.
  - El mismo medio informa que entre enero y julio de 2026 se recaudaron $919.866 millones por percepciones de Ganancias.
  
  — [El Cronista: Por qué no se eliminó el dólar tarjeta](https://www.cronista.com/economia-politica/por-que-no-se-elimino-el-dolar-tarjeta-cuanto-recaudo-arca-en-lo-que-va-de-2026/) [secundaria, prensa]; [iProfesional: paso a paso para no pagar la percepción del 30%](https://www.iprofesional.com/impuestos/445594-dolar-tarjeta-paso-a-paso-para-no-pagar-la-percepcion-del-30-por-ciento-de-arca-ex-afip) [secundaria, prensa]
  - **Contradicción.** Notas de dic-2025 y ene-2026 anunciaron que desde el 2-ene-2026 ARCA dejaría de aplicar el 30% a los consumos con tarjeta en dólares o en el exterior, salvo los servicios turísticos pagados en pesos. — [Info Viajera](https://www.infoviajera.com/2025/12/desde-enero-ya-no-regira-el-recargo-del-30-por-compras-con-tarjeta-en-dolares/); [El Chorrillero](https://elchorrillero.com/nota/2026/01/03/594021-dolar-tarjeta-arca-elimina-ese-30-adicional-pero-no-en-todos-los-consumos/amp/); [Comercio y Justicia](https://comercioyjusticia.info/economia/el-recargo-del-30-seguira-vigente-para-servicios-turisticos-abonados-en-pesos/) [secundarias, prensa]
  - La cobertura posterior, con El Cronista con datos hasta julio de 2026 e iProfesional en marzo de 2026, sostiene que el 30% sigue vigente. — [iProfesional, marzo 2026](https://www.iprofesional.com/finanzas/448976-gastos-en-dolares-como-pagar-la-tarjeta-en-marzo-2026-y-evitar-el-recargo-del-30) [secundaria]
- El 30% no se aplica si el resumen se paga con dólares propios o si la tarjeta de débito está asociada a una cuenta en dólares. — [iProfesional](https://www.iprofesional.com/impuestos/445594-dolar-tarjeta-paso-a-paso-para-no-pagar-la-percepcion-del-30-por-ciento-de-arca-ex-afip) [secundaria]
- El 30% es un pago a cuenta. Quien no paga Ganancias ni Bienes Personales puede pedir la devolución, y desde el 1-ene-2026 está habilitado el trámite para las percepciones de 2025. — [La Voz de Cataratas](https://lavozdecataratas.com/2026/01/05/arca-habilito-la-devolucion-del-30-por-consumos-en-dolares-de-2025/); [Monarca](https://askmonarca.com/guias/percepciones-exterior) [secundarias]
  - Un blog de agencia advierte que las devoluciones se demoran o son parciales. — [Tributo Simple](https://tributosimple.com/como-conviene-pagar-meta-ads-en-argentina-tarjeta-vs-linea-de-credito-local/) [secundaria]
- **Ingresos Brutos:** la percepción provincial sobre servicios digitales del exterior ronda el 2% en CABA y PBA. Córdoba aplica alrededor del 3% y Santa Fe grava los servicios digitales del exterior desde el 1-jul-2025. — [DoubleTick](https://www.doubletick.com.ar/blog/impuestos-meta-ads-tarjeta-credito-argentina-2026/); [Axyoma: Impuestos de Google Ads y Meta Ads](https://www.axyoma.com.ar/impuestos-google-ads-meta-ads-argentina/) [secundarias]
- **Total para Meta Ads pagado con tarjeta en 2026:** hasta un 53% de recargo (21% de IVA, 30% de percepción y alrededor de 2% de IIBB). Sobre $100 de pauta, se comprometen unos $153. — [DoubleTick](https://www.doubletick.com.ar/blog/impuestos-meta-ads-tarjeta-credito-argentina-2026/); [Global66](https://www.global66.com/blog/como-afectan-los-impuestos-a-tus-gastos-digitales/) [secundarias]
- Según un blog de 2025, hasta nov-2025 la respuesta oficial era que, cuando el pago se procesa como transacción local, solo se cobra el 0,6% del impuesto a los débitos y créditos. — [Saldo](https://blog.saldo.com.ar/pagar-menos-en-meta-2025/) [secundaria, dato viejo y no verificado]
- Si la tarjeta está a nombre de otra persona, la empresa puede no poder computar las percepciones. Conviene una tarjeta a nombre del CUIT que factura. — [DoubleTick](https://www.doubletick.com.ar/blog/impuestos-meta-ads-tarjeta-credito-argentina-2026/) [secundaria]

### Inferences
- Pagar en ARS a Meta no evitaría el 30%. Según El Cronista, la percepción alcanza "la contratación de servicios prestados por empresas no residentes" y en 2026 se mantuvo incluso para los servicios turísticos pagados en pesos. La ventaja del WABA en ARS sería otra: previsibilidad, sin variación por tipo de cambio entre una tarjeta de tarifas y la siguiente. No encontré una fuente que trate específicamente WhatsApp facturado en ARS.
- Si la startup es una SAS o SRL responsable inscripta: el IVA se recupera como crédito fiscal, el 30% se computa contra Ganancias (es costo financiero, no definitivo, salvo que no tenga impuesto determinado) y los IIBB pueden computarse si es contribuyente de la jurisdicción. Su costo económico queda en 1,00 a 1,03 veces la tarifa de Meta, pero el desembolso inicial puede llegar a 1,53 veces.
- Si la startup es monotributista, el costo definitivo es de alrededor de 1,23 veces (IVA más IIBB), más el 30% que se recupera solo vía devolución.
- Comprar a un BSP argentino que factura en pesos con factura A cambia la estructura: no hay percepción del 30% porque es un proveedor local, y el IVA es crédito fiscal. Pero se paga el recargo del BSP. Según los cocientes de la sección 2, ese recargo va del 5% al 15% sobre la tarifa de Meta.

### Gaps
- No encontré el texto de la resolución general que modificó la RG 5617 en dic-2025 o ene-2026, ni su alcance exacto (si incluye o excluye los servicios digitales y a las personas jurídicas).
- No encontré si Meta Platforms Ireland está hoy en el Anexo II de la RG 4240, ni si al facturar en ARS Meta emite un comprobante con IVA discriminado.
- Medios de pago aceptados para un WABA en ARS: tarjeta argentina, línea de crédito, facturación mensual vía BSP o débito local. No encontré documentación de Meta ni de BSP argentinos sobre esto.
- Si el cambio de moneda por defecto para WABA nuevos en LatAm es real, porque es un reporte de usuario.

## 4. ¿El resumen diario al dueño es gratis si la ventana de 24 h está abierta? ¿Qué pasa los lunes o si el dueño no escribió?

### Takeaway
**Desde el 1-oct-2026, ya no es gratis.** Un template utility se cobra (USD 0,026 o ARS 37,68) esté o no abierta la ventana. Si la ventana está abierta, el resumen se puede mandar como mensaje de texto libre, que se descuenta de la franquicia de 1.000 mensajes de servicio del número. Esa franquicia es gratis mientras dure, pero en la fase 1 la comparten todos los talleres. Los lunes, o si el dueño no escribió en las últimas 24 h, la ventana está cerrada y solo se puede mandar un template aprobado, que se cobra. Hasta el 30-sep-2026 la respuesta era otra: el utility dentro de la ventana era gratis y solo se pagaban los lunes y los días sin actividad.

### Cited Findings
- La ventana dura 24 h desde el último mensaje del usuario. — [respond.io](https://respond.io/blog/whatsapp-pricing-change-2026) [secundaria]
- Hasta el 30-sep-2026, un utility dentro de la ventana era gratis; fuera de ella, se cobraba. — [respond.io: WhatsApp Pricing](https://respond.io/help/whatsapp/whatsapp-pricing) [secundaria]
- Desde el 1-oct-2026, los utility dentro de la ventana se cobran a la tarifa utility del país del destinatario. — [Meta: Upcoming pricing updates…](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages) [Meta, vía fragmento de búsqueda]; [Wati](https://www.wati.io/en/blog/whatsapp-service-message-pricing/) [secundaria]
- La franquicia de 1.000 gratis cubre mensajes de servicio, no templates utility. — [Wati](https://www.wati.io/en/blog/whatsapp-service-message-pricing/) [secundaria]
- Fuera de la ventana solo se pueden mandar templates; el texto libre exige la ventana abierta. — [Kyrios Systems](https://help.kyriossystems.com/en/articles/13678362-managing-whatsapp-conversations-categories-pricing-service-windows-and-free-entry-points) [secundaria]

### Inferences
- **Ejemplo de ventana.** Si el resumen sale a las 8:00 y el dueño escribió por última vez el día anterior a las 19:00, la ventana está abierta hasta las 19:00 de hoy. Si escribió por última vez a las 7:30 del día anterior, está cerrada desde las 7:30 de hoy.
- **Lunes.** Si el dueño escribió por última vez el viernes o el sábado antes de las 8:00, la ventana está cerrada el lunes a las 8:00. Hay que mandar un template, y tiene que estar aprobado y categorizado como utility: si Meta lo recategoriza como marketing, cuesta USD 0,0618.
- **Estrategia desde el 1-oct-2026:**
  - con la ventana abierta, mandar el resumen como texto libre, que entra en la franquicia de servicio;
  - con la ventana cerrada, mandar el template utility;
  - una vez agotada la franquicia, los dos cuestan lo mismo (USD 0,026), así que la estrategia solo ahorra mientras quede franquicia.
- **Diseño.** El contenido de cada mensaje (texto, audio o foto) no cambia el precio. Sí lo cambia la cantidad de mensajes salientes: juntar la respuesta en un solo mensaje, en vez de un acuse de recibo más la respuesta, reduce el costo a la mitad.
- **Hasta el 30-sep-2026.** Con un dueño activo de martes a viernes, se pagaban solo los resúmenes de los lunes (unos 4,3 por mes) y los de los días sin actividad: alrededor de USD 0,11 a 0,23 por mes. Hoy, el mismo uso cuesta unos USD 0,57 por mes en resúmenes (22 × 0,026) si se mandan como template.

### Gaps
- No vi la definición actual de Meta de "utility" ni sus ejemplos. Un recordatorio del tipo "service due for client X", enviado al dueño como dato operativo de su cuenta, debería ser utility, pero no lo pude contrastar con la guía de categorización de Meta.

## 5. ¿Cuánto cuesta por mes y por taller en la fase 1 y en la fase 2?

### Takeaway
Tarifa de lista de Meta (USD 0,026 por utility o servicio; ARS 37,68), sin impuestos ni recargo de BSP:
- **Fase 1**, el dueño escribe al número de la startup: unos **USD 0,81 por mes por taller** mientras la startup tenga 4 talleres o menos en un número. Con 50 o más talleres, **unos USD 6,0 a 6,4 por mes** (ARS 8.700 a 9.300), porque la franquicia de 1.000 mensajes de servicio se comparte. Si el bot manda dos mensajes por cada consulta, sube a unos USD 11,7.
- **Fase 2**, el número propio de cada taller: **unos USD 1,13 por mes** (ARS 1.630) con 5 mensajes de bot por conversación, porque las respuestas entran en la franquicia de 1.000 del taller. Sube a unos USD 2,2 con 8 mensajes por conversación y a unos USD 8,9 con 10.

Con impuestos pagando con tarjeta, el desembolso inicial es hasta 1,53 veces esos montos.

### Cited Findings
- Tarifas usadas: utility, authentication y servicio a USD 0,026 (ARS 37,6798); marketing a USD 0,0618 (ARS 89,562). Tarjeta del 1-oct-2026, no verificada contra el CSV de Meta. — [Flowcall](https://www.flowcall.co/blog/whatsapp-business-api-pricing); [Zernio](https://zernio.com/whatsapp-api-pricing) [secundarias]
- 1.000 mensajes de servicio gratis por mes por número; utility sin franquicia; se cuenta por mensaje. — [Chat2Desk](https://chat2desk.com/en/blog/articles/whatsapp-business-api-billing-to-change); [Wati](https://www.wati.io/en/blog/whatsapp-service-message-pricing/) [secundarias]
- Los entrantes no se cobran. — [Blueticks](https://blueticks.co/blog/whatsapp-business-api-pricing-2026) [secundaria]
- La ventana FEP de 72 h por anuncio Click-to-WhatsApp hace gratis todo lo que se manda en ese lapso. — [Mastermind KB](https://mastermind.helpscoutdocs.com/article/1222-managing-whatsapp-conversations-a-guide-to-categories-duration-and-free-entry-point-conversations) [secundaria]

### Inferences

Todo lo que sigue es cálculo propio sobre las tarifas citadas. Las cuentas se hicieron en Python.

**Fase 1: un solo número de la startup, compartido por N talleres (régimen desde el 1-oct-2026)**

Supuestos:
- 22 días hábiles por mes;
- 10 mensajes entrantes por día, gratis;
- una respuesta de texto libre por cada entrante, o sea 220 mensajes de servicio por taller por mes;
- un resumen diario como template utility (22 por mes);
- 2 recordatorios por semana como template utility (2 × 4,33 = 8,7, redondeado a 9 por mes).

Cálculo:
- **Utility:** (22 + 9) = 31 × 0,026 = **USD 0,806** (ARS 1.168) por taller por mes. Se paga siempre, haya o no ventana.
- **Servicio:** 220 × N mensajes contra 1.000 gratis por número. Lo que se paga por taller es max(0; 220·N − 1.000) / N × 0,026.

| Talleres en el número (N) | Servicio cobrado por taller | Total por taller (USD) | Total por taller (ARS, a 37,68) |
|---|---|---|---|
| 1 a 4 | 0 (880 o menos entra en los 1.000) | **0,81** | 1.168 |
| 10 | 120 msg → 3,12 | **3,93** | 5.690 |
| 25 | 180 msg → 4,68 | **5,49** | 7.950 |
| 50 | 200 msg → 5,20 | **6,01** | 8.704 |
| 100 | 210 msg → 5,46 | **6,27** | 9.081 |
| tope sin franquicia | 220 msg → 5,72 | **6,53** | 9.458 |

Sensibilidad:
- Con 2 mensajes salientes por entrante (440 de servicio) y N = 50: **USD 11,73** por taller.
- Con resúmenes y recordatorios como texto libre cuando la ventana está abierta: no cambia nada a escala, porque la franquicia ya está agotada y servicio cuesta lo mismo que utility. Solo ayuda con N ≤ 4.
- Si el recordatorio se categoriza como marketing: +9 × (0,0618 − 0,026) = +USD 0,32.
- Cálculo histórico, régimen vigente hasta el 30-sep-2026: el servicio era gratis y el utility dentro de la ventana también. Solo se pagaban los lunes y los días sin actividad: unos **USD 0,11 a 0,45 por taller por mes**. A escala (N = 50), el cambio de oct-2026 multiplicó el costo de la fase 1 por unas 13 a 55 veces: 6,01 / 0,45 y 6,01 / 0,11.
- Mitigación posible: repartir talleres entre varios números de la startup, a unos 4 talleres por número, para multiplicar la franquicia de 1.000. No verifiqué cuántos números permite un business portfolio, ni si Meta considera esto un abuso. Lo marco como riesgo.

**Fase 2: número propio del taller (régimen desde el 1-oct-2026)**

Supuestos:
- 30 conversaciones de clientes por semana = 130 por mes;
- K mensajes del bot por conversación, todos de servicio y dentro de la ventana que abre el cliente;
- 10 avisos de "auto listo" por semana = 43 por mes, como template utility, porque el aviso llega días después de que el cliente escribió y la ventana suele estar cerrada.

| Mensajes del bot por conversación (K) | Servicio por mes | Servicio cobrado (USD) | "Auto listo" 43 × 0,026 (USD) | **Total por taller (USD)** | ARS |
|---|---|---|---|---|---|
| 3 | 390 | 0 | 1,13 | **1,13** | 1.633 |
| 5 | 650 | 0 | 1,13 | **1,13** | 1.633 |
| 8 | 1.040 | 40 → 1,04 | 1,13 | **2,17** | 3.140 |
| 10 | 1.300 | 300 → 7,80 | 1,13 | **8,93** | 12.937 |

Sensibilidad y riesgos:
- Si el cliente escribió en las últimas 24 h, el aviso de "auto listo" puede ir como texto libre y entra en la franquicia: costo cercano a USD 0.
- Los clientes que llegan por un anuncio Click-to-WhatsApp del taller abren 72 h gratis.
- Si el taller manda promociones ("20% off en cambio de aceite"), son marketing: USD 0,0618 (ARS 89,56) cada una, sin franquicia.
- Si el taller usa el mismo número para sus respuestas manuales por la API, esas también consumen la franquicia.
- Tramos de volumen: si los WABA de los talleres cuelgan del business portfolio de la startup, el volumen utility se suma, pero no llega a ningún tramo.

**Impuestos sobre esos montos (pago directo a Meta con tarjeta)**
- Monotributista: unos 1,23 veces de costo definitivo (IVA 21% más IIBB 2%), más el 30% recuperable solo vía devolución. Fase 1 a escala: 6,01 → unos USD 7,4 definitivos y unos USD 9,2 de desembolso. Fase 2: 1,13 → unos USD 1,4 definitivos y 1,73 de desembolso.
- Responsable inscripto con Ganancias: el costo económico queda en unos 1,0 a 1,03 veces, pero el desembolso inicial es de hasta 1,53 veces.
- A través de un BSP: sumar entre 5% y 15% sobre la tarifa de Meta, según los cocientes observados, más el abono mensual del BSP si lo tiene.

### Gaps
- Las tarifas del 1-oct-2026 para Argentina no se verificaron contra el CSV o el PDF oficial de Meta, ni en USD ni en ARS.
- La cifra de 1.000 mensajes de servicio gratis por número no se vio en un fragmento de Meta. Si fuera por WABA o por portfolio, la fase 2 con números de taller dentro del portfolio de la startup cambiaría mucho.
- Cuántos mensajes manda de verdad el bot por consulta del dueño o por conversación con un cliente. Es el supuesto que más mueve el resultado.
- El régimen tributario efectivo de la startup (monotributo o responsable inscripto) y la vigencia exacta de la RG 5617 para personas jurídicas que pagan servicios digitales en 2026.
