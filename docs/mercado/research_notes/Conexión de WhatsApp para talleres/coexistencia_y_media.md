# WhatsApp Cloud API (octubre de 2026): coexistencia con la app Business y recepción de media y notas de voz

> **Nota de método (9 de octubre de 2026).** La política de salida de red de esta sesión bloqueó la lectura directa de `developers.facebook.com`, `vercel.com`, `docs.360dialog.com`, `docs.ycloud.com` y `twilio.com`. Los datos marcados como **(Meta)** o **(Vercel)** vienen de extractos de esas páginas oficiales que devolvió el buscador, no de una lectura completa. Conviene revisar la página antes de fijar un número en una spec. Lo marcado **(proveedor)** sale de documentación o blogs de BSP y vendors: es evidencia secundaria. El único documento leído completo es la guía local de `after()` de Next.js 16.3.8, en `node_modules`.

---

## A1. Alta (onboarding): qué versión de Embedded Signup y qué plazos

### Takeaway
La coexistencia se activa con Embedded Signup, eligiendo conectar un número de la app WhatsApp Business. Meta da de baja Embedded Signup v2 y v3, y sus versiones de *public preview*, el **15 de octubre de 2026**, así que una integración nueva tiene que construirse sobre **v4**. Según un medio especializado, el tipo de feature `coex` no migra solo.

### Cited Findings
- Embedded Signup v2 y v3, incluidas sus versiones de *public preview*, se dan de baja el 15 de octubre de 2026, y hay que migrar a v4 antes de esa fecha (Meta) — [Embedded Signup overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview/)
- El banner de deprecación de cada página menciona solo v2, pero la tabla de versiones retira cuatro: v2, v3, v2-public-preview y v3-public-preview (análisis de terceros) — [ppc.land](https://ppc.land/metas-embedded-signup-v4-is-here-but-the-october-15-clock-is-ticking/); [botsense.io](https://botsense.io/blog/embedded-signup-v2-deprecation-v3-also-ends/)
- Un blog de terceros da el 8 de octubre de 2026 como fecha de baja de v2, lo que contradice el 15 de octubre que publica Meta. Conviene planificar con la fecha de Meta — [resumen del buscador sobre blogs de migración](https://wisemelon.ai/blog/whatsapp-embedded-signup-v4-migration/); contradice a [Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview/)
- En v4, la configuración de producto se mueve a una configuración de *Facebook Login for Business* y el objeto `extras` del lanzamiento queda vacío (proveedor o medio) — [ppc.land](https://ppc.land/metas-embedded-signup-v4-is-here-but-the-october-15-clock-is-ticking/)
- Según una nota de mayo de 2026, tres tipos de feature no migran solos y requieren acción manual: `only_waba_sharing`, `marketing_messages_lite` y `coex` (medio especializado, sin verificar en Meta) — [ppc.land](https://ppc.land/metas-embedded-signup-v4-is-here-but-the-october-15-clock-is-ticking/)
- Una guía estima hasta una semana de trabajo para pasar a v4, incluido el testing (proveedor) — [360dialog blog](https://360dialog.com/blog/embedded-signup-versions-migration/)
- Al hacer el alta por Embedded Signup, Meta convierte la cuenta de WhatsApp Business existente en una cuenta de mensajería compatible hacia atrás y la comparte con el integrador. El paso de registrar el número se saltea en coexistencia, porque el número ya está registrado (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- En el flujo, el negocio elige "Connect a WhatsApp Business App number", y eso activa la coexistencia (proveedor) — [chakrahq](https://chakrahq.com/article/whatsapp-coexistence-business-app-register-cloud-api/)

### Inferences
- Para la fase 2, cualquier implementación que se empiece hoy debe ser v4. Construir sobre v2 o v3 no tiene sentido: quedan seis días.
- La fase 1, con el número propio de la startup, no necesita Embedded Signup ni coexistencia. Alcanza con el número registrado directamente en Cloud API.

### Gaps
- No pude leer la página de versiones de Embedded Signup para confirmar los parámetros exactos de v4 para coexistencia (`featureType`, nombre de la config). Falta verificarlo en Meta.
- No encontré ningún anuncio de prórroga del 15 de octubre de 2026.

---

## A2. Requisitos: versión de la app, países (¿Argentina?) y requisitos del número

### Takeaway
El requisito oficial confirmado es tener **WhatsApp Business app 2.24.17 o superior** y un número que ya esté activo en la app Business, no en WhatsApp personal. **Argentina parece estar soportada**: nunca figuró en las listas de exclusión que encontré y un vendor la lista con soporte completo. Pero no conseguí la lista oficial de Meta.

### Cited Findings
- El cliente tiene que usar la app WhatsApp Business versión 2.24.17 o superior (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- El changelog de Meta fue sumando países a la coexistencia en Embedded Signup: Australia, Japón, Filipinas, Rusia, Corea del Sur, Turquía y EEE/UE/Reino Unido. También habilitó números con código de India. Las entradas no aparecían fechadas en el extracto (Meta) — [WhatsApp changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- Una lista anterior de países excluidos de la coexistencia: Australia, India, Japón, Nigeria, Filipinas, Rusia, Corea del Sur, Sudáfrica y Turquía. Argentina no figura (proveedor) — [GoHighLevel changelog](https://ideas.gohighlevel.com/changelog/whatsapp-coexistence-general-availability)
- Fuentes de 2026 dicen que Nigeria y Sudáfrica se habilitaron desde abril de 2026. Otra guía de 2026 todavía las lista como únicas exclusiones, así que hay contradicción (proveedores) — [resumen del buscador: chakrahq, timelines.ai, whautomate](https://chakrahq.com/article/whatsapp-coexistence-live-eu-uk-europe-whatsapp-business-for-api-live/)
- Una tabla de soporte por país lista a Argentina con soporte completo de coexistencia (vendor) — [ChakraHQ, Coexistence Support by Country](https://chakrahq.com/product/whatsapp/tools/whatsapp-coexistence-support/)
- La elegibilidad se decide por número durante el alta, no solo por país: un error de país en Embedded Signup es la prueba práctica (proveedor) — [resumen del buscador](https://timelines.ai/whatsapp-coexistence-account-setup-guide)
- El número tiene que estar activo en la app WhatsApp Business, no en WhatsApp personal (proveedor) — [resumen del buscador, provixon / sheetwa](https://provixon.com/posts/whatsapp-coexistence-keep-business-app-add-api)
- Restricción general de la plataforma, no específica de coexistencia: no pueden usarla negocios de Cuba, Irán, Corea del Norte, Siria ni de Crimea, Donetsk y Luhansk. Desde el 15 de mayo de 2024, Türkiye ya no está restringida para Cloud API (Meta) — [WhatsApp support / policy](https://developers.facebook.com/documentation/business-messaging/whatsapp/support)

### Inferences
- Argentina nunca apareció en las listas de exclusión, ni en la vieja ni en las de 2026, y un vendor la marca como soportada. Lo más probable es que esté habilitada. Hay que validarlo con un alta real de un número +54 antes de comprometer la fase 2.
- Como el owner del taller ya usa la app Business, el requisito de "número activo en la app Business" se cumple casi seguro. El riesgo está en los talleres que usan WhatsApp personal: tendrían que migrar primero a la app Business, que es gratis.

### Gaps
- No encontré la lista oficial y vigente de Meta de países no soportados para coexistencia.
- No encontré ningún requisito oficial de antigüedad o actividad del número, como "X días de uso" o "historial de chats". Algunos vendors lo insinúan, pero no hallé una fuente que lo cuantifique.

---

## A3. Qué se sincroniza: contactos, historial, grupos y media

### Takeaway
Con permiso del negocio se sincronizan los **contactos** y hasta **unos 180 días de historial 1:1**, en tres fases. **Los grupos no se sincronizan.** El contenido multimedia del historial solo llega si se envió en las **últimas dos semanas**. El integrador tiene **24 horas** después del alta para pedir la sincronización. Si no lo hace, hay que dar de baja el número y repetir el flujo.

### Cited Findings
- Después del alta se pueden sincronizar los contactos y el historial de mensajes, si el negocio lo permite. Se inicia con una llamada a la *SMB App Data API* con `sync_type` `history` o `contacts` (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- Hay 24 horas desde el alta para sincronizar contactos e historial. Pasado ese plazo, hay que dar de baja al cliente y repetir el flujo (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- El webhook `history` llega en fases: la fase 0 cubre del día 0 (el alta) al día 1, la fase 1 del día 1 al 90 y la fase 2 del día 90 al 180 (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- En los mensajes con media del historial se omite el contenido. Un webhook `history` aparte trae el contenido y el *media asset ID*, pero solo si el mensaje se envió en las últimas dos semanas (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- Lo mismo dicho por un tercero: la media descargable cubre lo enviado en los 14 días previos a la conexión, y de lo anterior queda solo el registro de texto (proveedor) — [instantreply.co](https://www.instantreply.co/blog/whatsapp-coexistence-what-actually-syncs-2026)
- Los chats grupales no se sincronizan (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- Los contactos llegan como webhooks `smb_app_state_sync`, con nombre, teléfono y acción `add` o `remove`. Los cambios posteriores generan nuevos webhooks (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- Existe un código de error que indica que el negocio desactivó la sincronización del historial desde la app (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- Contradicción entre proveedores: Dualhook dice que el historial llega solo si el negocio eligió compartirlo, y Whautomate dice que no importa el historial y que los chats previos quedan solo en la app (proveedores) — [Dualhook](https://dualhook.com/docs/coexistence); [Whautomate](https://whautomate.com/whatsapp-coexistence)

### Inferences
- El backend de la fase 2 tiene que disparar la sincronización de historial y contactos de forma automática, apenas termina el alta. Dejarla para un paso manual del owner es riesgoso por la ventana de 24 horas.
- Las fotos y notas de voz de más de 14 días no van a estar disponibles para reconstruir el historial de un cliente del taller. Solo queda el texto.
- Los grupos no sirven como canal para el bot.

### Gaps
- No confirmé el límite de tamaño ni la cantidad de mensajes por webhook `history`, ni la paginación exacta de las fases.

---

## A4. Ecos de mensajes y webhooks de coexistencia

### Takeaway
Sí: cada mensaje que el owner manda desde la app Business llega al backend como webhook **`smb_message_echoes`**. Hay que suscribirse a cuatro campos: `account_update`, `history`, `smb_app_state_sync` y `smb_message_echoes`. Los mensajes enviados desde dispositivos acompañantes no soportados no generan eco.

### Cited Findings
- Los campos de webhook a los que hay que suscribirse son `account_update`, `history`, `smb_app_state_sync` y `smb_message_echoes`. Este último describe los mensajes nuevos que el cliente manda con la app Business después del alta (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- Después del alta, el negocio puede seguir enviando mensajes 1:1 desde la app y desde los dispositivos acompañantes soportados, y WhatsApp mantiene el historial sincronizado entre ambos lados (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- Los mensajes enviados desde clientes acompañantes no soportados no disparan `smb_message_echoes`, así que no se pueden reflejar (Meta, vía extracto del buscador) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- Después del alta se desvinculan todos los dispositivos acompañantes, y solo se pueden volver a vincular los soportados. WhatsApp para Windows y para WearOS no están soportados (proveedor) — [respond.io](https://respond.io/help/whatsapp/whatsapp-coexistence)
- Hay ejemplos reales en repos públicos: un CRM no registraba las respuestas escritas en la app hasta que empezó a procesar `smb_message_echoes`. Otro PR importa seis meses de historial, contactos y ecos (código abierto, evidencia práctica) — [Vishar-site PR #951](https://github.com/vvetrov41-lgtm/Vishar-site/pull/951); [Metorite PR #723](https://github.com/Hathi-Labs/Metorite/pull/723)

### Inferences
- Con los ecos, el bot puede saber cuándo respondió el owner a mano y callarse en esa conversación, con una lógica tipo "humano tomó el control" por N minutos. Es clave para que el bot y el owner no se pisen.
- Si el owner usa WhatsApp Desktop en Windows, esos mensajes no llegan como eco. Hay que avisarle durante el alta.

### Gaps
- No pude ver el JSON exacto de `smb_message_echoes`, por ejemplo si trae el `id` del mensaje y el destinatario con el mismo formato que `messages`. Hay que verificarlo en Meta o en un webhook de prueba.

---

## A5. Throughput y funciones deshabilitadas

### Takeaway
Un número en coexistencia tiene un throughput **fijo de 20 mensajes por segundo** (Meta). Se pierden la edición y el borrado de mensajes. Según proveedores, también se apagan los mensajes temporales, los de una sola visualización y la ubicación en tiempo real en chats individuales, y las listas de difusión quedan de solo lectura. La **Calling API no funciona** con coexistencia.

### Cited Findings
- Para seguir siendo compatibles con la app Business, los números en uso en la app y en Cloud API tienen un throughput fijo de 20 mps (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- Contradicción: un proveedor habla de un máximo de 5 mps para una cuenta de app Business (proveedor; contradice a Meta) — [resumen del buscador sobre guías de coexistencia](https://chakrahq.com/article/whatsapp-business-app-api-coexistence-2026/)
- Como referencia, el throughput estándar de Cloud API citado es 80 mps (issue de GitHub, no Meta) — [chatwoot #13961](https://github.com/chatwoot/chatwoot/issues/13961)
- La tabla comparativa de Meta indica que editar y revocar mensajes deja de estar soportado (Meta, vía extracto) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- Los mensajes temporales, los de una sola visualización y la ubicación en tiempo real se deshabilitan en chats individuales, y las listas de difusión pasan a solo lectura (proveedores, no verificado en Meta) — [respond.io](https://respond.io/help/whatsapp/whatsapp-coexistence); [instantreply.co](https://www.instantreply.co/blog/whatsapp-coexistence-what-actually-syncs-2026)
- La Calling API no está soportada con coexistencia (proveedores) — [360dialog Coexistence](https://docs.360dialog.com/docs/resources/phone-numbers/coexistence); [respond.io](https://respond.io/blog/how-to-use-whatsapp-business-app-and-api-at-the-same-time). Para llamar por API, el número tiene que estar solo en Cloud API — [2Chat](https://help.2chat.io/en/articles/15197191-using-whatsapp-business-api-with-the-whatsapp-business-app-coexistence). En contra, Wati marca las llamadas como soportadas en la app y en la API — [Wati](https://www.wati.io/en/blog/coexistence-for-smbs/). SleekFlow aclara que las llamadas siguen funcionando en la app, que no es lo mismo que llamar por API — [SleekFlow](https://sleekflow.io/en-us/blog/whatsapp-coexistence)

### Inferences
- 20 mps sobra para un taller chico. El límite no condiciona el diseño.
- Las llamadas de voz siguen funcionando en la app del owner. Lo que no se puede es atenderlas o hacerlas desde el bot.

### Gaps
- No encontré confirmación oficial de Meta sobre los mensajes temporales, los de una sola visualización, la ubicación en tiempo real y las listas de difusión. Viene solo de proveedores.

---

## A6. Precios: ¿son gratis los mensajes que el owner manda desde la app?

### Takeaway
**Sí.** Los mensajes que el negocio manda desde la app Business siguen siendo gratis y no abren, extienden ni afectan las ventanas de conversación de Cloud API (Meta). Lo que manda el bot por Cloud API se cobra según la tarifa de Cloud API. Ojo: desde el **1 de octubre de 2026** los mensajes de servicio dejaron de ser ilimitados y gratis. Ahora hay **1.000 gratis por mes y por número**. Esto viene de blogs de proveedores, que coinciden entre sí, y Meta tiene una página de "upcoming pricing updates" sobre el tema.

### Cited Findings
- Los mensajes que el negocio envía desde la app WhatsApp Business siguen siendo gratis, y los enviados por Cloud API pagan la tarifa de Cloud API (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- Los mensajes enviados desde la app no crean, extienden ni afectan las ventanas de conversación ni el precio de Cloud API (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- Meta publica una página sobre los cambios de precio de Meta Business Agent, mensajes de servicio y utility (Meta; no pude leerla completa) — [Upcoming pricing updates](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages)
- Desde el 1 de octubre de 2026, cada número tiene 1.000 mensajes de servicio gratis por mes, que no se acumulan, y se cobra desde el 1.001 a la tarifa del país del destinatario, igual que utility. Las plantillas utility dentro de la ventana de 24 horas también dejaron de ser gratis. Los mensajes entrantes siguen gratis (proveedores) — [YCloud](https://www.ycloud.com/blog/whatsapp-api-message-pricing-update-effective-october-1-2026); [respond.io](https://respond.io/blog/whatsapp-pricing-change-2026)
- Meta Business Agent se cobra por tokens, USD 2 por millón, desde el 1 de agosto de 2026 (proveedor) — [zernio](https://zernio.com/blog/meta-business-agent-pricing)
- Con Tech Provider, el cliente carga su propio medio de pago en Meta después del alta y Meta le factura el uso de la API. El Tech Provider factura sus otros servicios. Los Solution Partners tienen línea de crédito y pueden facturar el uso de la API directamente (Meta) — [Solution Partner overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/overview)

### Inferences
- **Fase 1:** las respuestas del bot a los owners por el número de la startup son mensajes de servicio. Hasta 1.000 por mes son gratis y después se pagan a la tarifa de Argentina. Hay que modelar ese costo.
- **Fase 2:** el owner sigue chateando gratis desde la app y solo las respuestas del bot cuestan. Si BrAInance va como Tech Provider, cada taller paga a Meta con su tarjeta, lo que complica el alta de un taller chico. Con un BSP que tiene línea de crédito, factura el BSP.

### Gaps
- No obtuve la tarifa vigente de Argentina para mensajes de servicio y utility desde el 1 de octubre de 2026.
- No confirmé en la página de Meta, leída completa, la cifra de 1.000 gratis por mes.

---

## A7. Inactividad, baja (offboarding) y reconexión

### Takeaway
Los proveedores coinciden en que el owner tiene que **abrir la app Business al menos cada 13 o 14 días** para que no se corte la conexión. No encontré esa regla en Meta. La baja la inicia el negocio desde la app y llega como webhook `account_update` con `PARTNER_REMOVED`. Desde febrero de 2026 también hay eventos `ACCOUNT_OFFBOARDED` y `account_reconnected`, y desde mayo de 2026 la reconexión es automática.

### Cited Findings
- Hay que abrir la app Business al menos una vez cada 14 días para mantener la conexión. Si no, la conexión puede eliminarse (proveedor) — [respond.io](https://respond.io/help/whatsapp/whatsapp-coexistence)
- 360dialog dice al menos una vez cada 13 días (proveedor; difiere en un día) — [360dialog Coexistence](https://docs.360dialog.com/docs/resources/phone-numbers/coexistence)
- Si se pierde la conexión, hay que reconectar el número como un canal de coexistencia nuevo (proveedor) — [respond.io](https://respond.io/help/whatsapp/whatsapp-coexistence)
- El negocio se desconecta desde la app en Settings > Account > Business Platform > Disconnect Account. El integrador recibe `account_update` con evento `PARTNER_REMOVED`, que puede incluir `disconnection_info` para indicar si la baja la inició el cliente o el sistema (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- El 4 de febrero de 2026 se agregó para coexistencia el evento `ACCOUNT_OFFBOARDED`, dentro de `account_update`. Se dispara cuando el número cambia de dispositivo y se vuelve a registrar, o cuando el negocio da de baja su número de la app (Meta) — [WhatsApp changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- El 18 de mayo de 2026 se agregó la reconexión: al volver a registrarse, el cliente ve un *opt-in* premarcado para reconectar los productos de Cloud API, y la reconexión se completa sola en pocos minutos (Meta) — [WhatsApp changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)

### Inferences
- Un taller cuyo owner deja de abrir la app, por ejemplo durante unas vacaciones de tres semanas, puede perder el bot. Conviene un recordatorio automático y un monitoreo de los eventos `account_update`.
- Si el owner cambia de celular, se dispara `ACCOUNT_OFFBOARDED`. El producto tiene que detectarlo y guiarlo por la reconexión.

### Gaps
- No encontré en la documentación oficial de Meta la regla de abrir la app cada 13 o 14 días, ni qué pasa exactamente al vencer ese plazo.
- No confirmé si después de la baja quedan datos o el historial accesibles por API.

---

## A8. ¿Quién puede usar coexistencia: BSP, Tech Provider o integración directa?

### Takeaway
La coexistencia se ofrece **solo a través de Embedded Signup, operado por un Solution Partner (BSP) o un Tech Provider**. No encontré un camino para un desarrollador directo que no tenga ninguno de esos roles. Para la fase 2, BrAInance tiene dos opciones: registrarse como Tech Provider ante Meta o integrarse con un BSP que lo ofrezca (360dialog, YCloud, Twilio, etc.).

### Cited Findings
- La guía oficial de coexistencia está dentro de la documentación de Embedded Signup para proveedores de soluciones (Meta) — [Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/); [Become a Tech Provider](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/get-started-for-tech-providers)
- Para ofrecer coexistencia hay que ser Solution Partner o Tech Provider, o hacerlo a través de uno (proveedores) — [resumen del buscador: ycloud, clientify, wati](https://www.ycloud.com/blog/whatsapp-business-app-coexistence-meta-update)
- Requiere un Solution Partner o Tech Provider de Meta, no un alta autoservicio, y un *endpoint* de webhooks (proveedor) — [chakrahq](https://chakrahq.com/article/whatsapp-business-app-api-coexistence-2026/)
- Un proveedor dice que para el webhook de ecos hay que usar Embedded Signup con *session logging* (proveedor) — [resumen del buscador](https://dualhook.com/docs/coexistence)

### Inferences
- Ser Tech Provider evita el margen del BSP, pero suma la verificación del negocio y la revisión de la app de Meta, y cada taller tiene que cargar su medio de pago en Meta. Con un BSP el alta es más simple y la facturación más centralizada, a cambio de un margen. Esa decisión es material para un ADR.

### Gaps
- No pude leer la página "Become a Tech Provider" para detallar los requisitos: verificación del negocio, *App Review*, permisos `whatsapp_business_management` y `whatsapp_business_messaging`, y plazos.
- No encontré una confirmación oficial de que un desarrollador directo sin rol de partner tenga prohibido usar coexistencia en su propio número.

---

## B1. Payload del webhook para audio y notas de voz entrantes

### Takeaway
Un audio entrante llega en `messages[]` con `type: "audio"` y un objeto `audio` que trae `id` (el *media ID*), `mime_type` y `sha256`. Según la página de Media de Meta, ahora también trae `url`. Para las notas de voz, varios proveedores muestran un booleano **`voice: true`**, pero **no logré confirmarlo en la referencia oficial de webhooks de Cloud API**. Hay que verificarlo con un payload real.

### Cited Findings
- Los webhooks de mensajes multimedia entrantes (imagen, video, etc.) incluyen la URL del media en la propiedad `url` (Meta, página de Media, vía extracto) — [Media](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media)
- El webhook no contiene el archivo: hay que descargarlo aparte a partir del *media ID* (guía de terceros) — [Hookdeck](https://hookdeck.com/webhooks/platforms/guide-to-whatsapp-webhooks-features-and-best-practices)
- Los objetos media de los webhooks traen `mime_type`, `sha256`, `id` y, en ejemplos de Cloud API, `url` (Meta, vía extracto; el ejemplo es de imagen) — [WhatsApp webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/)
- Para **enviar**, `voice: true` marca una nota de voz, que debe ser Ogg con códec OPUS. Si se omite, se envía como audio común (Meta) — [Audio messages](https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/audio-messages)
- La API On-Premises, ya discontinuada, usaba un `type` específico `voice` además de `audio` (Meta, legado) — [On-Premises webhooks components](https://developers.facebook.com/docs/whatsapp/on-premises/webhooks/components)
- Bird documenta un objeto `audio` con `voice: true` para notas grabadas en el chat, junto a `id`, `url` y `mime_type` OGG/Opus (proveedor; su propio formato, no necesariamente el de Meta) — [Bird, Receiving WhatsApp audio](https://bird.com/docs/guides/whatsapp/receiving-whatsapp/audio)
- YCloud muestra `type: "audio"` con `link`, `id`, `sha256` y `mime_type`, sin campo `voice` (proveedor) — [YCloud inbound examples](https://docs.ycloud.com/reference/whatsapp-inbound-message-webhook-examples)
- Desde el 17 de marzo de 2026, las notas de voz que **envía** el negocio generan un webhook de estado `played` cuando el usuario las reproduce (Meta) — [Audio messages](https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/audio-messages)

### Inferences
- El parser tiene que tratar `type === "audio"` como candidato a transcripción, haya o no `audio.voice`. No conviene depender de `voice` para decidir si se transcribe: un owner también puede reenviar un `.mp3` o `.m4a`.
- Hay que guardar el `sha256` del webhook para verificar la integridad de la descarga y deduplicar.

### Gaps
- No confirmé en la referencia oficial actual de Cloud API si el objeto `audio` entrante incluye `voice` ni cuál es el `mime_type` exacto de una nota de voz entrante. Lo esperable es `audio/ogg; codecs=opus`, pero no está verificado. Hay que loguear un payload real en el número de prueba.

---

## B2. Obtener la URL y descargar el media: autenticación, expiración y retención

### Takeaway
Hay dos pasos. `GET /{MEDIA_ID}` con el token devuelve un JSON con `url`, `mime_type`, `sha256`, `file_size` e `id`. Después se hace un `GET` de esa `url`, que suele estar en `lookaside.fbsbx.com`, **con el mismo `Authorization: Bearer`**. La URL **vence a los 5 minutos**. El *media ID* recibido por webhook **sirve 7 días**; antes eran 30.

### Cited Findings
- Las URLs de media vencen a los 5 minutos. Después hay que volver a consultar el ID para obtener una URL nueva (Meta) — [Media](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media)
- La descarga requiere el token: sin él, la request falla. Abrir la URL directamente da un error de acceso. La respuesta es el binario, con `content-type` igual al tipo MIME (Meta) — [Media](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media)
- Los *media IDs* de webhooks vencen a los 7 días. Los que devuelve la API al subir archivos, a los 30 (Meta) — [Media](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media)
- El changelog dice que el plazo de descarga de los *media IDs* de webhook pasó de 30 a 7 días "después del 9 de octubre". El año no se ve en el extracto; la página de Media vigente ya dice 7 días (Meta) — [WhatsApp changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- La respuesta de `GET /{MEDIA_ID}` tiene `messaging_product`, `url`, `mime_type`, `sha256`, `file_size` e `id`, y la `url` empieza con `https://lookaside.fbsbx.com` (proveedor) — [360dialog media](https://docs.360dialog.com/docs/messaging/media/upload-retrieve-or-delete-media)
- Si se pide una URL ya vencida se recibe 404 y hay que pedir una URL nueva (tercero) — [Medium, descarga a S3](https://medium.com/@shreyas.sreedhar/downloading-media-using-whatsapps-cloud-api-webhooks-and-uploading-it-to-aws-s3-bucket-via-nodejs-07c5cbae896f)
- Un reporte de usuario: un 404 en `lookaside` se resolvió pidiendo una URL fresca y descargándola con el header `Authorization`. El error 100, subcódigo 33, en `GET /{MEDIA_ID}` se debía a permisos del token (foro, anecdótico) — [Make community](https://community.make.com/t/whatsapp-cloud-api-media-download-fails-code-100-subcode-33-despite-correct-token-and-permissions/113293)
- Algunas referencias de terceros listan `User-Agent` como header de la descarga, pero no como obligatorio (tercero; sin confirmación de Meta) — [chatarchitect mirror](https://support.chatarchitect.com/books/meta-whatsapp/page/whatsapp-cloud-api-media-download-api-developer-documentation)

### Inferences
- El job de procesamiento siempre tiene que hacer `GET /{MEDIA_ID}` justo antes de descargar, aunque el webhook ya traiga `url`, y reintentar ese paso si recibe 404 o 401. Nunca hay que guardar la URL como referencia permanente.
- Hay que copiar el binario a almacenamiento propio (Vercel Blob, S3 o Postgres si es chico). Después de 7 días ya no se puede volver a bajar de Meta.
- Si el cliente HTTP sigue redirecciones, hay que confirmar que no pierda ni duplique el header `Authorization`.

### Gaps
- No encontré documentado cuánto tiempo Meta retiene el binario en sus servidores más allá de la validez del *media ID*.

---

## B3. Formatos y límites de tamaño (audio y fotos)

### Takeaway
Cloud API soporta audio AAC, AMR, MP3, M4A y OGG (**solo Opus, mono**), con **16 MB** por archivo. Las notas de voz son Ogg/Opus. Meta menciona además un máximo general de **100 MB** para media en Cloud API, y los archivos del cliente que se pasan de ese tamaño generan el error de webhook **131052**.

### Cited Findings
- Tipos de audio soportados, cada uno con 16 MB: AAC (`audio/aac`), AMR (`audio/amr`), MP3 (`audio/mpeg`), M4A (`audio/mp4`) y OGG (`audio/ogg`, solo códec OPUS y solo mono; `audio/ogg` sin códec no se acepta) (Meta) — [Media, supported media types](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media)
- Las notas de voz deben ser archivos Ogg con códec OPUS (Meta) — [Audio messages](https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/audio-messages)
- El tamaño máximo soportado para media en Cloud API es 100 MB. Los archivos más grandes que manda un cliente generan el error de webhook 131052 (Meta) — [Media](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media)

### Inferences
- Los 16 MB por tipo parecen aplicar al **envío**. Para lo **entrante**, el techo práctico sería 100 MB. Una nota de voz típica pesa mucho menos, pero el pipeline debería rechazar o truncar audios muy largos antes de transcribirlos, por costo.

### Gaps
- Los formatos y límites de imagen (lo esperable es JPEG y PNG con 5 MB, pero no quedó verificado en esta sesión) no aparecieron en los extractos. Las fotos entrantes llegan como `type: "image"` con `id`, `mime_type`, `sha256` y, opcionalmente, `caption`, aunque el `caption` no quedó confirmado en una fuente oficial en esta sesión.

---

## B4. Confiabilidad de webhooks: reintentos, idempotencia, firma y tiempos de respuesta

### Takeaway
Meta reintenta todo lo que no reciba **HTTP 200** durante **hasta 7 días**, con frecuencia decreciente. Puede **duplicar** eventos, así que hay que deduplicar por el `id` del mensaje (`wamid`). Hay que verificar `X-Hub-Signature-256` (HMAC-SHA256 del body crudo con el *app secret*). El estándar de latencia es una **mediana de 250 ms o menos** y **menos del 1 % por encima de 1 s**. Los payloads pueden pesar hasta 3 MB.

### Cited Findings
- Ante un código distinto de 200, o si la entrega falla, Meta reintenta con frecuencia decreciente hasta que funcione, durante hasta 7 días (Meta) — [WhatsApp webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/)
- Antes eran hasta 30 días de reintentos; ahora son 7 (Meta) — [WhatsApp changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog)
- Los reintentos se envían a todas las apps suscriptas y pueden generar notificaciones duplicadas (Meta) — [WhatsApp webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/)
- Un mismo mensaje puede generar un estado `delivered` y otro `failed` (Meta) — [WhatsApp webhooks](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/)
- Estándar de latencia: Meta entrega webhooks en forma concurrente, con mediana de 250 ms o menos y menos del 1 % por encima de 1 s (Meta) — [Webhooks overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview/)
- Los payloads de webhook pueden pesar hasta 3 MB. Se soporta mTLS como alternativa a la *allowlist* de IPs, que Meta cambia periódicamente (Meta) — [Webhooks overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview/)
- Los payloads se firman con SHA256 en el header `X-Hub-Signature-256`, con prefijo `sha256=`, usando el *app secret* (Meta, guía general de webhooks de la plataforma) — [Meta Webhooks for Messenger Platform](https://developers.facebook.com/documentation/business-messaging/messenger-platform/webhooks)
- En el foro hay un reporte de una firma de WhatsApp que siempre fallaba con el mismo código que funcionaba para Facebook e Instagram, sin respuesta oficial (foro) — [Meta community thread](https://developers.facebook.com/community/threads/937289794026555/)
- WhatsApp entrega con semántica *at-least-once*, así que los duplicados son normales (guía de terceros) — [Hookdeck](https://hookdeck.com/webhooks/platforms/guide-to-whatsapp-webhooks-features-and-best-practices)

### Inferences
- En Next.js, la firma se calcula sobre `await request.text()` (los bytes crudos), antes de hacer `JSON.parse`, y se compara con `crypto.timingSafeEqual`.
- La idempotencia se resuelve con una restricción `UNIQUE` sobre el `wamid` en Postgres y un `INSERT ... ON CONFLICT DO NOTHING`. Si el insert no inserta nada, se responde 200 sin reprocesar.
- Una mediana de 250 ms no deja margen para descargar ni transcribir dentro de la request. El handler solo verifica, persiste y responde.

### Gaps
- No encontré un *timeout* duro documentado, en segundos, después del cual Meta considera fallida la entrega. Solo está el estándar de latencia.

---

## B5. Correr esto en Vercel serverless: timeouts, procesamiento en segundo plano y límites de la Graph API

### Takeaway
Con Fluid compute, las funciones de Vercel tienen **300 s por defecto en todos los planes**. En Hobby ese también es el máximo; en Pro y Enterprise se puede llegar a **800 s**, y a 1800 s en beta. `after()` de `next/server` es lo recomendado para trabajo posterior a la respuesta, pero **comparte el timeout de la función** y se cancela si se vence. Para que no se pierda nada, hace falta una cola o una tabla de trabajos con reintento propio.

### Cited Findings
- Fluid compute: 300 s por defecto en todos los planes. En Hobby, 300 s es también el máximo. En Pro y Enterprise, el máximo es 800 s (Vercel) — [Vercel Functions Limits](https://vercel.com/docs/functions/limitations)
- El máximo extendido de 1800 s está en beta para Pro y Enterprise, solo en ciertos runtimes de Node.js, Bun y Python, y se configura por función (Vercel) — [Vercel Functions Limits](https://vercel.com/docs/functions/limitations); [changelog 30 min](https://vercel.com/changelog/vercel-functions-can-now-run-up-to-30-minutes)
- Si la función no termina a tiempo, devuelve 504 `FUNCTION_INVOCATION_TIMEOUT` (Vercel) — [KB timeouts](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out)
- Con Next.js 15.1 o superior, Vercel recomienda `after()` de `next/server` en lugar de `waitUntil()`. Las promesas tienen el mismo timeout que la función y se cancelan si esta se vence (Vercel) — [@vercel/functions API reference](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package); [KB timeouts](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out)
- Para trabajos que superan esos límites, Vercel recomienda Vercel Workflows (Vercel) — [KB timeouts](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out)
- Docs locales de Next 16.3.8: `after` corre durante la duración máxima por defecto o configurada (`maxDuration`) de la ruta. Se ejecuta aunque la respuesta falle, y en Route Handlers puede usar `headers()` y `cookies()` (Next.js, leído completo) — [`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md`](../../../../node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md)
- Un usuario reporta que las funciones con `maxDuration = 1800` reutilizan instancias mucho menos: abren una nueva cada unas 30 requests (comunidad, anecdótico) — [Vercel Community](https://community.vercel.com/t/functions-with-1800s-extended-duration-beta-rarely-reuses-instances-20x-more-new-instances/49614)
- Límite de 360dialog sobre su proxy: con más de 5 requests fallidas a `/media` en una hora, se bloquea `GET /{MEDIA_ID}` para ese número durante una hora (proveedor; puede ser propio de 360dialog y no de Meta) — [360dialog media](https://docs.360dialog.com/docs/messaging/media/upload-retrieve-or-delete-media)
- Un issue de Chatwoot reporta errores 429 (código 131053) cuando Meta descarga media desde URLs del integrador, por *rate limiting* según el ASN del hosting. Afecta el **envío** con `link`, no la descarga entrante (issue de GitHub) — [chatwoot #13540](https://github.com/chatwoot/chatwoot/issues/13540)

### Inferences
- Flujo recomendado para la fase 1:
  1. El webhook verifica la firma, inserta el evento con un `UNIQUE` sobre `wamid` y responde 200 en milisegundos.
  2. `after()` descarga el audio (`GET /{MEDIA_ID}` y después la URL), lo guarda en almacenamiento propio y lo manda a transcribir.
  3. Una tabla de estado (`pending`, `downloaded`, `transcribed`, `failed`) y un cron de Vercel que barre los pendientes cubren los fallos de `after()`. Meta no reintenta un webhook que ya recibió 200.
- La ventana de 7 días del *media ID* da margen para reprocesar. La de 5 minutos de la URL obliga a pedir la URL en el mismo paso que la descarga.
- 300 s alcanzan para descargar y transcribir una nota de voz típica en Hobby. Si la transcripción es lenta, conviene una cola o un Workflow.
- Hay que evitar ráfagas de reintentos fallidos contra `/media`, sobre todo si se usa un BSP con ese bloqueo de 5 fallas por hora: *backoff* y un tope de reintentos.

### Gaps
- No encontré límites oficiales de Meta para el endpoint de media de la Graph API, ni el esquema de *rate limit* de Cloud API para llamadas que no son de mensajería.
- No investigué colas concretas (Vercel Queues, QStash, Inngest) ni el estado de Vercel Workflows en octubre de 2026. No es parte de este alcance.
- La página de throughput de Meta no apareció con cifras en los extractos. El dato de 80 mps estándar sale de un issue de terceros.
