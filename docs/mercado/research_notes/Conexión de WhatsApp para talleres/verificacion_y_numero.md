# Verificación del negocio y número de WhatsApp Business Platform para una startup argentina (2026)

_Notas de investigación al 9 de octubre de 2026. **Cómo se obtuvieron:** desde este entorno, el proxy bloquea `developers.facebook.com`, `facebook.com` y `web.archive.org`, así que las páginas de Meta no se pudieron leer completas. Lo que se atribuye a Meta sale de los extractos que devuelve el buscador sobre esas páginas oficiales. Antes de decidir algo que dependa de una cifra puntual, hay que abrir la página. Las fuentes de proveedores (BSP) y blogs se marcan como **[BSP]** o **[blog]**. Los relatos de experiencias propias se marcan como **[anecdótico]**._

## 1. Portfolio comercial de Meta y verificación del negocio: ¿es obligatoria para arrancar? ¿Qué se puede hacer sin verificar? ¿Qué documentos sirven en Argentina? ¿Puede verificar un monotributista? ¿Cuánto tarda y por qué rechazan?

### Takeaway
Para arrancar en Cloud API no hace falta verificar. Un portfolio sin verificar ya puede registrar un número real y mandar plantillas a 250 usuarios únicos por día, con un tope de 2 números y 250 plantillas. La verificación hace falta para escalar (2.000, 20 números, más WABAs), para la revisión del nombre visible, para la cuenta oficial (OBA) y para ser Tech Provider. Meta dice que puede tardar hasta 14 días hábiles. Las causas de rechazo más comunes son que el nombre legal no coincide exactamente, que se presenta un documento "autogenerado" sin sello o que el sitio web no carga o no tiene HTTPS.

### Cited Findings
**Qué se puede hacer sin verificar**
- Meta dice que la revisión del nombre visible y los chequeos de la cuenta "no son necesarios para empezar" y que se puede empezar a mandar mensajes enseguida. La revisión del nombre de todos los números arranca recién cuando se completa la verificación del negocio. — [Meta Business Help: About WhatsApp Business Display Name](https://www.facebook.com/business/help/338047025165344)
- Un portfolio nuevo arranca con un límite de mensajería de 250: es la cantidad de usuarios únicos a los que se puede escribir fuera de la ventana de atención al cliente en 24 horas móviles. — [Meta for Developers: Messaging Limits](https://developers.facebook.com/documentation/business-messaging/whatsapp/messaging-limits)
- Un portfolio nuevo puede registrar al principio hasta **2 números de empresa**. Si el negocio se verifica o llega al límite de 2.000, Meta sube el tope a **20** automáticamente. — [Meta for Developers: Business phone numbers](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers)
- En un portfolio sin verificar, cada WABA admite hasta **250 plantillas**. Un portfolio verificado con al menos un número con nombre visible aprobado admite hasta **6.000**. — [Meta for Developers: WhatsApp accounts](https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts/)
- Con un negocio sin verificar no se pueden crear varias WABA. Según el texto del error de Embedded Signup, solo se pueden crear más "cuando terminan la verificación del negocio y los chequeos de la cuenta de WhatsApp". — [Meta for Developers: Embedded Signup Flow Errors](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/errors/)
- Al arrancar con Cloud API, Meta crea solo una WABA de prueba y un número de prueba. Esas cuentas tienen límites más laxos y no piden medio de pago para mandar plantillas. — [Meta for Developers: Get Started](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started); [About the platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform)
- Se pueden pedir hasta **dos números 555 de EE. UU.** (+1 555), que se verifican solos. Sirven como alternativa para probar sin una SIM argentina. — [Meta for Developers: Business phone numbers](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers)
- Hay una contradicción entre proveedores. Uno sostiene que Embedded Signup y Coexistence no avanzan sin un portfolio verificado. — [BSP, vía buscador: guías de Coexistence](https://guiawabusiness.cliengo.com/coexistence). Esto choca con lo que dice Meta en el punto anterior: que la verificación no hace falta para empezar.

**Proceso, documentos y requisitos**
- Meta pide que el nombre legal del documento coincida **exactamente** con el de la configuración del negocio. Si no coincide, hay que cambiar la configuración o presentar otro documento. El documento tiene que mostrar también la dirección completa y, si se verifica por teléfono, el número. — [Meta Business Help: Solucionar problemas con la verificación del negocio](https://es-la.facebook.com/business/help/2342133782492969)
- Meta no acepta documentos que llenó y presentó el propio negocio sin firma ni sello oficial. Tampoco acepta la solicitud de registro en lugar del certificado final. — [Meta Business Help (es-la)](https://es-la.facebook.com/business/help/2342133782492969); [WATI [BSP]: Reasons why your business can't be verified](https://support.wati.io/en/articles/11463209-reasons-why-your-business-can-t-be-verified)
- La verificación solo se hace en algunos idiomas. Si el idioma del documento no está entre ellos, hay que presentar una traducción al inglés con el sello de la agencia que la hizo. — [Meta Business Help (es-la)](https://es-la.facebook.com/business/help/2342133782492969). _No se pudo confirmar si el español está en la lista; ver Gaps._
- Una factura de servicios con teléfono pero sin el nombre comercial no alcanza. Según la guía de Meta (en su versión para EE. UU.), las facturas de servicios y las comerciales no sirven para acreditar el nombre legal. — [Meta Business Help (es-la)](https://es-la.facebook.com/business/help/2342133782492969); [Meta Business Help: Submitting Documentation for Organization Confirmation](https://www.facebook.com/business/help/497330474385146)
- Para confirmar el vínculo con el negocio, Meta ofrece varios métodos: email, teléfono, SMS, mensaje de WhatsApp o verificación de dominio. Para el email, la dirección suele tener que estar en un dominio parecido al del sitio que Meta encuentra para el negocio. — [Meta Business Help: Verify your business](https://www.facebook.com/business/help/2058515294227817); [Troubleshoot (en-gb)](https://en-gb.facebook.com/business/help/2342133782492969)
- El sitio web puede jugar en contra: entre los motivos de rechazo figura un sitio que no carga, que no tiene HTTPS o que lleva a una página de error. — [Meta Business Help: Troubleshoot](https://en-gb.facebook.com/business/help/2342133782492969)
- Otros motivos de rechazo que lista Meta son un documento ilegible o de baja resolución, un documento vencido, la falta del nombre legal y la sospecha de información falsa. — [Meta Business Help: Troubleshoot](https://en-gb.facebook.com/business/help/2342133782492969)
- **Plazo oficial:** Meta dice que la decisión puede tardar **hasta 14 días hábiles**. — [Meta Business Help: Verify your business](https://www.facebook.com/business/help/2058515294227817). Los proveedores hablan de 1 a 5 o de 2 a 5 días hábiles. — [Aurora Inbox [blog/BSP]](https://www.aurorainbox.com/en/2026/05/14/what-is-meta-business-verification/); [Alibaba Cloud [BSP]](https://www.alibabacloud.com/help/en/chatapp/use-cases/how-to-register-as-a-meta-tech-provider)
- Si falta información adicional y no se entrega a tiempo, hay que empezar el proceso de nuevo. — [Meta Business Help (es-la)](https://es-la.facebook.com/business/help/2342133782492969)
- **[anecdótico]** En el foro de desarrolladores de Meta hay hilos de rechazos sin motivo explícito, que terminan en reclamos a soporte. — [Meta Developer Community Forum](https://developers.facebook.com/community/threads/1118229882692747/)
- **[BSP/blog]** Algunas guías dicen que quien pide la verificación necesita control total del portfolio y la autenticación en dos pasos activa, según una de ellas "durante al menos 7 días" antes. Meta no confirma ese plazo. — [AsistChat [blog]](https://asistchat.com/blog/como-verificar-negocio-meta-business-paso-a-paso); [SendPulse [BSP]](https://sendpulse.com/latam/blog/verificar-cuenta-de-meta-business-suite-guia)

**Persona humana (monotributista) frente a sociedad**
- En su guía para EE. UU., Meta acepta documentos de empresas unipersonales (sole proprietors), como los Schedules C, E o F con sello del IRS. Es decir, una persona que opera sola puede verificar si tiene un documento oficial con el nombre legal. — [Meta Business Help: Organization Confirmation](https://www.facebook.com/business/help/497330474385146)
- Para Argentina, un proveedor lista como documento la **constancia de inscripción de AFIP/ARCA con CUIT**, más un comprobante de domicilio. — [Aurora Inbox [blog/BSP], mayo de 2026](https://www.aurorainbox.com/en/2026/05/14/what-is-meta-business-verification/)
- La constancia de monotributo se baja online, gratis, y muestra el CUIT, el nombre o razón social, la categoría, los impuestos, la actividad y el domicilio fiscal. — [argentina.gob.ar](https://www.argentina.gob.ar/servicio/obtener-constancia-de-inscripcion-al-monotributo); [Yo Facturo [blog]](https://yo-facturo.com/blog/constancia-de-inscripcion-de-arca-como-descargarla/)
- **Contradicción:** según el resumen del buscador, algunas guías advierten que la constancia que uno mismo descarga podría caer en la categoría de "documentos autogenerados" que Meta rechaza. No se pudo identificar cuál de las fuentes lo dice. Otras guías locales la dan por válida. — [Leadsales [BSP]](https://leadsales.io/blog/verificar-negocio-meta-business-para-usar-api/); [Chattigo [BSP]](https://blog.chattigo.com/whatsapp-business/verifica-tu-whatsapp-business-en-meta). Meta no tiene una lista oficial por país que se haya podido consultar.
- La verificación del negocio es gratis y es distinta de Meta Verified, que es una suscripción paga para mostrar una insignia. — [Leadsales [BSP]](https://leadsales.io/blog/que-es-meta-verified-verificacion/)

### Inferences
- **Para la fase 1 no hace falta esperar a la verificación.** Con 250 usuarios únicos por día y 2 números alcanza de sobra para un piloto con pocos talleres. Lo único que cambia es la plantilla que inicia la conversación: los mensajes de servicio dentro de la ventana de 24 h no cuentan para el límite.
- **Un monotributista probablemente puede verificar,** porque Meta acepta empresas unipersonales en otros países. Pero el nombre legal es el nombre y apellido de la persona, tal como figuran en ARCA. Eso obliga a mostrar el vínculo entre la persona y la marca, por ejemplo con el nombre legal en el pie del sitio. Una SAS da más margen: tiene el estatuto inscripto, que es claramente un documento oficial con sello, y una razón social que puede coincidir con la marca.
- **Riesgo concreto:** la constancia de ARCA no lleva firma ni sello visibles, aunque la emite el organismo. Puede salir rechazada por "autogenerada". Conviene tener un plan B: un estatuto o contrato social inscripto (en la SAS), un certificado bancario o un comprobante de domicilio con el nombre legal.
- **Plazo razonable:** de 2 a 4 semanas desde que se inicia hasta que se aprueba, contando un rechazo y un reenvío. El mínimo oficial es "hasta 14 días hábiles".

### Gaps
- No se pudo leer la página oficial de Meta con la lista de documentos aceptados por país, ni la lista de idiomas admitidos. Falta confirmar que el español está, y que la constancia de ARCA, el estatuto de una SAS o el contrato de una SRL figuran como aceptados.
- No se encontró ningún caso documentado, ni de éxito ni de rechazo, de un **monotributista argentino** que haya verificado su portfolio para WhatsApp. Lo que hay son guías genéricas.
- No se verificó el requisito de "2FA activa 7 días antes".

## 2. Requisitos del número: SIM prepaga nueva, número virtual o fijo; mover un número que ya está en la app; PIN de dos pasos; migración entre WABAs o BSPs

### Takeaway
Sirve cualquier número propio, con código de país y de área, que pueda recibir un SMS o una llamada de voz: una SIM prepaga, un fijo verificado por llamada o un virtual, siempre que sea propio y reciba SMS o llamadas. Un número que hoy está en la app de WhatsApp tiene dos caminos. Uno es darlo de baja en la app y perder el historial. El otro es "Coexistence", si está en la app **WhatsApp Business**, que mantiene la app y la API en el mismo número; para Argentina figura como disponible según proveedores. El PIN de 6 dígitos de la verificación en dos pasos se está eliminando de a poco para los números de Cloud API que cumplen los requisitos.

### Cited Findings
- Un número elegible tiene que ser del negocio, tener código de país y de área (no se admiten códigos cortos) y poder recibir llamadas de voz o SMS. — [Meta for Developers: Business phone numbers](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers)
- El registro tiene cuatro pasos: crear el número en la WABA, pedir el código, verificarlo y registrarlo para Cloud API. **El registro se hace solo por API**, no desde WhatsApp Manager ni desde el panel de la app. — [Meta for Developers: Register a business phone number](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration)
- **Fijos:** el Cloud API los admite y se verifican con una llamada. Si la línea tiene un IVR o un desvío, la llamada tiene que llegar a una persona o a un contestador; conviene desactivar el IVR y el desvío. — [Sinch [BSP]](https://sinch.com/blog/whatsapp-business-using-landline/); [Sanuker [BSP]](https://sanuker.com/landline-whatsapp-business-platform-en/); [WATI [BSP]](https://www.wati.io/en/blog/whatsapp-api-prerequisites/)
- Para registrarse de la forma estándar, el número **no puede estar activo** en WhatsApp ni en WhatsApp Business. Si lo está, hay que darlo de baja antes. — [WATI [BSP]: API prerequisites](https://www.wati.io/en/blog/whatsapp-api-prerequisites/); [Rapidbott [BSP]](https://docs.rapidbott.com/help-center/platform/whatsapp-channel/connect-with-whatsapp-cloud-api/using-a-phone-number-already-in-use-with-whatsapp-app)
- **[BSP, sin confirmar]** Un proveedor dice que un número que se usó en WhatsApp tiene que quedar inactivo 6 meses antes de pasarlo a la API. Parece una política de ese proveedor, no una regla de Meta. — vía buscador, [Text-World [BSP]](https://text-world.com/blog/whatsapp-api-phone-number-requirements.html)
- **Coexistence** permite usar el mismo número en la app WhatsApp Business y en el Cloud API. Requisitos según proveedores:
  - la app en versión 2.24.17 o posterior;
  - historial de uso en la app: un proveedor pide 7 días como mínimo, otro recomienda entre 1 y 2 meses;
  - si el número estaba en la API con otro BSP, hay que desconectarlo antes (en la app: Configuración > Cuenta > Business Platform > Desconectar);
  - la elegibilidad la decide Meta según la antigüedad y la calidad.

  — [360dialog [BSP]: WhatsApp Coexistence](https://docs.360dialog.com/docs/waba-management/the-360-client-hub/embedded-signup/whatsapp-coexistence); [WATI [BSP]: Troubleshooting Coexistence](https://support.wati.io/en/articles/11875544-troubleshooting-whatsapp-coexistence-signup-process-common-issues-and-how-to-resolve-them)
- Meta tiene una guía para incorporar a usuarios de la app WhatsApp Business a través de Embedded Signup. Coexistence entra por ese flujo de socios. — [Meta for Developers: Onboard WhatsApp Business app users](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users/)
- **Países:** las listas viejas excluían la UE, el Reino Unido, Australia, Japón, Nigeria, Sudáfrica y otros. Según fuentes de marzo de 2026, solo quedaban excluidas Nigeria y Sudáfrica. Argentina figura como disponible. — [Chatwoot discussion #11216 [anecdótico]](https://github.com/orgs/chatwoot/discussions/11216); [HighLevel [BSP]](https://help.gohighlevel.com/support/solutions/articles/155000003417-whatsapp-coexistence-feature-for-dual-platform-messaging); [Cliengo [BSP]](https://guiawabusiness.cliengo.com/coexistence); [Basework [BSP, Argentina]](https://www.basework.com.ar/blog/conectar-whatsapp-api-coexistence)
- **PIN de dos pasos:**
  - se puede configurar un PIN de 6 dígitos que se pide al registrar el número;
  - el PIN hace falta para cambiarlo y para borrar un número en estado *Connected*;
  - si se pierde, se puede cambiar por API, pero la verificación en dos pasos no se puede desactivar por API.

  — [Meta for Developers: Two-Step Verification](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/two-step-verification/)
- **Cambio de 2026:** el PIN de 6 dígitos "está quedando obsoleto para los números de Cloud API que cumplen los requisitos" y el cambio se habilita de a poco. En esos números desaparece la pestaña de verificación en dos pasos de WhatsApp Manager. — [Meta for Developers: Two-Step Verification](https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/two-step-verification/)
- Cloud API soporta 80 mensajes por segundo por número por defecto. Además, cada número puede mandar **1 mensaje cada 6 segundos al mismo usuario**. — [Meta for Developers: Throughput](https://developers.facebook.com/documentation/business-messaging/whatsapp/throughput); vía buscador, [Meta Get Started](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started)
- **[anecdótico]** En el foro de Meta hay reportes de códigos de verificación que no llegan. — [Meta Developer Community Forum](https://developers.facebook.com/community/threads/207747728966507/)

### Inferences
- **Recomendación para la fase 1:** una **SIM prepaga argentina nueva**, a nombre del titular, que nunca haya estado en WhatsApp. Se verifica por SMS y se registra por API el mismo día. Un fijo también sirve, verificado por llamada, pero la línea tiene que poder atender o tener contestador. Un número virtual tiene un riesgo: si el proveedor lo recicla, se pierde el control del número.
- **Hay que guardar el PIN** en un gestor de secretos si el número todavía lo usa. Hace falta para borrar el número o para migrarlo más adelante.
- **Fase 2 (los números de cada taller):** casi todos los talleres ya usan WhatsApp, y muchos la app WhatsApp Business. Coexistence es el camino natural, porque conserva la app y el historial. Pero exige entrar por Embedded Signup como Tech Provider (ver sección 5). Un taller que usa la app **WhatsApp común**, no la Business, tendría que pasarse primero a WhatsApp Business o dar de baja el número.

### Gaps
- No se pudo leer la página de Meta sobre **migrar un número entre WABAs o BSPs**: si hay que desactivar la verificación en dos pasos, si se conservan las plantillas, el límite y la calidad, y cuánto tarda. No hay fuente en esta sesión.
- Faltan detalles oficiales de Coexistence: cuánto historial se sincroniza (se habla de hasta 6 meses, sin fuente confirmada), qué funciones de la app se pierden y si cambia el precio de los mensajes enviados desde la app.
- Falta confirmar el límite de destinatarios del número de prueba. Antes eran 5; no se confirmó en la documentación actual.
- **Posible problema con números argentinos, sin verificar:** el formato del móvil (+54 9 …). El `wa_id` que llega por webhook incluye el 9. Hay reportes anecdóticos, no encontrados en esta sesión, de errores de "destinatario no permitido" con el número de prueba según cómo se cargue el 9. Conviene probarlo en el piloto.

## 3. Nombre visible, cuenta oficial (OBA) y Meta Verified for Business en 2026

### Takeaway
Para empezar no hace falta que aprueben el nombre visible. La revisión arranca cuando se verifica el negocio y, desde ese momento, cada cambio de nombre pasa por revisión. El nombre tiene que tener una relación clara con el negocio y con su marca pública, por ejemplo la del sitio. La cuenta oficial (OBA, con el tilde) exige verificación, 2FA, nombre aprobado, 30 días en la plataforma y ser un negocio "notable": para una startup chica no es realista. No se pudo confirmar que Meta Verified for Business esté disponible en Argentina.

### Cited Findings
- El nombre visible tiene que estar relacionado con el negocio, cumplir las políticas de comercio de WhatsApp y respetar las pautas de formato. La revisión arranca después de la verificación del negocio y, desde ahí, todo cambio requiere aprobación. — [Meta Business Help: About WhatsApp Business Display Name](https://www.facebook.com/business/help/338047025165344)
- **[BSP]** Causas comunes de rechazo:
  - nombre completo de una persona, término genérico, ubicación geográfica genérica, eslogan o descripción larga;
  - mayúsculas incorrectas (todo en mayúsculas, salvo siglas);
  - emojis, símbolos como ™ o formato de URL;
  - y la más frecuente: un nombre que no coincide con la marca del sitio o de los demás canales.

  — [AiSensy [BSP]](https://m.aisensy.com/blog/display-name-for-whatsapp-business-api/); [WATI [BSP]](https://www.wati.io/en/blog/choosing-a-display-name-for-your-whatsapp-business-account/); [360dialog [BSP]: Display Names](https://docs.360dialog.com/docs/resources/phone-numbers/display-names)
- **[BSP]** Para apelar, conviene poner el nombre legal del portfolio y el nombre visible en el pie del sitio, con la misma URL que figura en el portfolio. Si se alcanza el límite de apelaciones, el nombre queda bloqueado entre 7 y 60 días. La revisión suele tardar entre 1 y 3 días hábiles. — [Spur [BSP]](https://help.spurnow.com/en/articles/9899432-how-to-appeal-for-whatsapp-business-display-name-rejection); [PayPerWA [blog]](https://payperwa.com/blog/whatsapp-display-name-guidelines-2026)
- **Requisitos de la OBA:**
  - cumplir la política de mensajería;
  - llevar al menos 30 días registrado en la plataforma;
  - tener el portfolio verificado;
  - tener la 2FA activa en el número;
  - tener el nombre visible aprobado.

  — [Meta for Developers: Official Business Accounts](https://developers.facebook.com/documentation/business-messaging/whatsapp/official-business-accounts/)
- Además, el negocio tiene que ser "notable", es decir, tener presencia sustancial en notas de medios con mucha audiencia. La OBA se otorga por número de teléfono, y que la rechacen no limita el perfil del negocio. — [Meta Business Help: Display Name / OBA](https://www.facebook.com/business/help/338047025165344)
- Meta Verified para WhatsApp Business se lanzó primero en Brasil, India, Indonesia y Colombia. Argentina no aparece en el anuncio. — [WhatsApp Blog](https://blog.whatsapp.com/introducing-ai-tools-meta-verified-and-more-for-businesses-on-whatsapp)
- **[BSP, sin confirmar]** Una guía de LATAM de 2026 dice que la insignia de la app es azul y que hay disponibilidad "según el país". Otra fuente dice que Argentina es elegible y da un precio estimado de USD 10 a 50 por mes. Otra da un rango de USD 14,99 a 349,99 por mes (con más de un año de antigüedad). Meta no publica la lista de países. — [Leadsales [BSP]](https://leadsales.io/blog/que-es-meta-verified-verificacion/); [respond.io [BSP]](https://respond.io/blog/whatsapp-business-account-price)
- La verificación del negocio no da la insignia de OBA ni la de Meta Verified. — [Aurora Inbox [blog/BSP]](https://www.aurorainbox.com/en/2026/05/14/what-is-meta-business-verification/); [Leadsales [BSP]](https://leadsales.io/blog/que-es-meta-verified-verificacion/)
- **[BSP, sin confirmar en Meta]** Una fuente dice que, para que aprueben el nombre, el negocio tiene que haber entregado 2.000 mensajes en 30 días. Ninguna otra fuente lo menciona. — vía buscador, guías de nombre visible ([AiSensy](https://m.aisensy.com/blog/display-name-for-whatsapp-business-api/))

### Inferences
- **Nombre visible:** usar la marca del producto, no el nombre del monotributista, y que el sitio muestre la marca y el nombre legal en el pie. Si el portfolio es una SAS cuya razón social coincide con la marca, el riesgo de rechazo baja.
- **OBA y Meta Verified:** no son necesarios para la fase 1. Para cada taller en la fase 2 tampoco, pero el usuario final va a ver un número sin tilde. La confianza se construye con el perfil completo (foto, descripción, sitio) y con que sea el número que el taller ya usaba.

### Gaps
- No se confirmó en una fuente de Meta si Meta Verified for Business en WhatsApp, en la app o en la API, está disponible en Argentina, ni su precio en 2026.
- Faltan las pautas oficiales de formato del nombre visible: largo máximo y reglas exactas. Solo hay fuentes de proveedores.

## 4. Límites de mensajería y calidad: niveles 2025-2026, cómo escalar, qué dispara restricciones y bloqueos, apelaciones

### Takeaway
Desde octubre de 2025 el límite se calcula por **portfolio**, no por número: todos los números lo comparten. Los niveles son 250, 2.000, 10.000, 100.000 e ilimitado. El primer escalón ahora es **2.000** (antes era 1.000) y se alcanza verificando el negocio o entregando 2.000 plantillas a usuarios únicos en 30 días con buena calidad. De ahí en adelante sube solo. La calidad se mide por bloqueos y reportes de los últimos 7 días. El límite cuenta usuarios únicos contactados fuera de la ventana de 24 horas, no mensajes de servicio.

### Cited Findings
- **Niveles:**
  - un portfolio nuevo arranca en 250 destinatarios únicos cada 24 horas móviles;
  - con una vía de escalado sube a 2.000;
  - después escala solo a 10.000, 100.000 e ilimitado.

  Los límites se calculan **a nivel del portfolio** y los comparten todos sus números. — [Meta for Developers: Messaging Limits](https://developers.facebook.com/documentation/business-messaging/whatsapp/messaging-limits)
- **Vías para llegar a 2.000:**
  - verificar el negocio;
  - que lo verifique el socio que hizo el alta;
  - entregar 2.000 plantillas fuera de la ventana de atención, a números únicos, en 30 días, con buena calidad.

  Después Meta analiza la calidad y aprueba o rechaza la escala automática. — [Meta for Developers: Messaging Limits](https://developers.facebook.com/documentation/business-messaging/whatsapp/messaging-limits)
- **Escala automática desde 2.000:** pide buena calidad en todos los números y plantillas, y haber usado al menos la mitad del límite en los últimos 7 días. Si se cumplen las dos condiciones, sube un nivel en menos de 6 horas. No se puede pedir a mano. — [Meta for Developers: Messaging Limits](https://developers.facebook.com/documentation/business-messaging/whatsapp/messaging-limits)
- El changelog confirma el cambio: el modelo pasó a ser por portfolio y no por número, y el primer escalón es 2.000 en lugar de 1.000. La página vieja de "rate-limits", con el modelo por número y 250 → 1.000, está desactualizada. — [Meta changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog); [página vieja](https://developers.facebook.com/docs/whatsapp/api/rate-limits/)
- **Fecha del cambio:** octubre de 2025, según proveedores. Los portfolios que ya existían quedaron con el límite más alto de cualquiera de sus números, y un número nuevo hereda el límite del portfolio. — [Bloomreach [BSP]](https://documentation.bloomreach.com/engagement/docs/whatsapp-messaging-limits); [Chatarmin [BSP]](https://chatarmin.com/en/blog/whats-app-messaging-limits)
- **Contradicciones entre proveedores:**
  - ActiveCampaign todavía dice que un portfolio verificado arranca en 1.000;
  - Blueticks y Uptail dicen que verificar lleva directo a 100.000;
  - la documentación de Meta y WATI (junio de 2026) dicen 2.000.

  — [ActiveCampaign [BSP]](https://help.activecampaign.com/hc/en-us/articles/21826249568540-WhatsApp-Messaging-Limits-What-You-Need-to-Know); [Blueticks [blog]](https://blueticks.co/blog/whatsapp-api-without-meta-verification); [WATI [BSP]](https://support.wati.io/en/articles/11463212-how-whatsapp-messaging-limits-work-and-how-to-increase-them)
- El límite se consulta en WhatsApp Manager > Herramientas de la cuenta > Límites de mensajería, o por API con el campo `whatsapp_business_manager_messaging_limit`. El campo `messaging_limit_tier` quedó obsoleto. — [Meta for Developers: Messaging Limits](https://developers.facebook.com/documentation/business-messaging/whatsapp/messaging-limits)
- **Calidad:** la calificación se basa en los mensajes de los últimos 7 días y en la reacción de los usuarios (bloqueos y sus motivos, reportes). — [Meta Business Help: Quality Rating](https://www.facebook.com/business/help/896873687365001)
- **Estados del número:**
  - **Flagged:** con calidad baja, el número pasa de *Connected* a *Flagged*. Si mejora en 7 días, vuelve a *Connected*; si no, vuelve igual pero con el límite un nivel más abajo. Mientras está en *Flagged* no puede subir de nivel.
  - **Restricted:** se alcanzó el límite. No se pueden mandar mensajes salientes hasta que pasen 24 horas.

  Los avisos llegan por email y al Business Manager. — [Meta Business Help: Quality Rating](https://www.facebook.com/business/help/896873687365001)
- **Sanciones por política,** separadas de la calidad: la cuenta puede quedar restringida o deshabilitada según la cantidad y la gravedad de las infracciones. Se ven y se apelan desde Business Support Home (Request Review). La decisión suele llegar en 24 a 48 horas y queda *Unchanged* o *Reversed*. No todas las infracciones por spam se pueden apelar. Un número bloqueado tiene que desbloquearse por apelación antes de volver a registrarlo. — [Meta for Developers: Policy enforcement](https://developers.facebook.com/documentation/business-messaging/whatsapp/policy-enforcement)
- Mandar mensajes fuera de la ventana de 24 h exige plantillas aprobadas, y la ventana se abre cuando el usuario escribe. Además hay límites por usuario para plantillas de marketing. — [Meta Get Started](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started); [Meta: Per-user marketing template limits](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/marketing-templates/per-user-limits/)
- **[BSP]** Algunas guías dicen que, una vez alcanzado un nivel, una caída de calidad no lo baja. Esto **contradice** a Meta, que dice que un número *Flagged* que no mejora pierde un nivel. — [Chatarmin / búsqueda](https://chatarmin.com/en/blog/whats-app-messaging-limits) frente a [Meta Quality Rating](https://www.facebook.com/business/help/896873687365001)

### Inferences
- **Fase 1:** el uso típico de un taller es responder consultas y mandar avisos de "su auto está listo" o "presupuesto". Casi todo pasa dentro de la ventana de 24 h o son plantillas de utilidad a clientes que escribieron antes. Con 250 por día se arranca sin problema.
- **Fase 2: el límite por portfolio importa.** Si los números de los talleres viven en el portfolio de **cada taller** (lo normal con Embedded Signup), cada uno tiene su propio límite de 250. Si se cargaran varios talleres en el portfolio de BrAInance, compartirían un solo límite: es otro motivo para que cada taller tenga su propio portfolio.
- **Lo que dispara restricciones:** mandar marketing a contactos que no dieron su consentimiento y plantillas que la gente bloquea o reporta. Para talleres, lo más seguro es limitar las plantillas iniciadas por el negocio a utilidad transaccional, con consentimiento registrado.

### Gaps
- No se encontró una lista oficial y exhaustiva de las conductas que llevan al bloqueo de la cuenta, más allá de "cantidad y gravedad" de las infracciones.
- No se confirmó si la vía de "el socio verifica por vos" (partner-led verification) está disponible para un Tech Provider o solo para Solution Partners.

## 5. Requisitos para actuar como Tech Provider e incorporar números de talleres con Embedded Signup

### Takeaway
Para incorporar los números de los talleres con Embedded Signup, BrAInance tiene que ser Tech Provider. Eso exige verificar el negocio, pasar App Review (acceso avanzado a `whatsapp_business_messaging` y `whatsapp_business_management`, con un video por permiso) y, según la versión de la documentación, Access Verification. El changelog dice que esta última ya no es obligatoria para ser Tech Provider. Por defecto se pueden sumar 10 clientes nuevos cada 7 días; con verificación y App Review, 200. Los talleres pagan a Meta con su propio medio de pago.

### Cited Findings
- **Pasos para ser Tech Provider:**
  1. Verificar el negocio. Si ya está verificado y vinculado a la app, el paso se marca solo.
  2. Pasar App Review, con video que muestre el envío de mensajes y la gestión de plantillas.
  3. Obtener acceso avanzado a `whatsapp_business_messaging` y `whatsapp_business_management`.

  — [Meta for Developers: Become a Tech Provider](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/get-started-for-tech-providers)
- No se pueden incorporar clientes hasta tener acceso avanzado a cada permiso. Sin acceso avanzado a `whatsapp_business_management`, las llamadas sobre WABAs ajenas devuelven el error 200. Hay que mandar un video por permiso, y las solicitudes que quedan en borrador no se revisan. — [Meta for Developers: WhatsApp App Review](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/app-review); [ejemplo de solicitud](https://developers.facebook.com/docs/whatsapp/solution-providers/app-review/sample-submission)
- **Límite de altas:**
  - por defecto, 10 clientes nuevos en 7 días móviles;
  - con Business Verification, App Review y Access Verification, sube solo a 200;
  - para más de 200 por semana hay que ser Meta Business Partner.

  — [Meta for Developers: Embedded Signup](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview/)
- **Contradicción en Meta:** el changelog dice que Access Verification ya no es obligatoria para ser Tech Provider, pero la página de Embedded Signup la sigue nombrando como condición para llegar a 200. — [Meta changelog](https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog) frente a [Embedded Signup](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview/)
- **[BSP]** Business Verification responde si la empresa existe; Access Verification, si el acceso es legítimo. Son revisiones distintas. — [Simplesdesk [BSP, Brasil]](https://simplesdesk.com.br/blog/como-ser-tech-provider-meta-whatsapp); [Infobip [BSP]](https://www.infobip.com/docs/whatsapp/tech-provider-program/setup-and-integration)
- El Tech Provider usa exclusivamente *business tokens* y no tiene línea de crédito con Meta. Los clientes que incorpora tienen que cargar su propio medio de pago. Ser Solution Partner es un proceso largo y solo conviene si hace falta facturarle a los clientes el uso de la API. — [Meta for Developers: Solution Partner overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/overview); [Become a Tech Provider](https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/get-started-for-tech-providers)
- **[BSP, sin confirmar]** Embedded Signup v2 deja de funcionar el 15 de octubre de 2026 y las integraciones tienen que pasar a v4. — vía buscador, guías de Coexistence ([Cliengo](https://guiawabusiness.cliengo.com/coexistence))

### Inferences
- **Orden sugerido:** verificar el negocio de BrAInance (o de la SAS) durante la fase 1. Eso desbloquea también la App Review de la fase 2. Los videos de App Review salen de la misma app de la fase 1 mandando mensajes y creando plantillas, así que conviene grabarlos apenas funcione.
- **Con 10 altas por semana sin App Review completa** alcanza para un piloto de pocos talleres. Con 200 por semana sobra para la beta.
- **Pago:** como el Tech Provider no tiene línea de crédito, cada taller carga su tarjeta en Meta. Hay que contemplarlo en el alta (tarjetas argentinas en USD, impuestos), porque es fricción para un taller chico.

### Gaps
- No se encontraron plazos de App Review para WhatsApp; solo hay relatos sueltos.
- No se aclaró si Access Verification sigue existiendo en octubre de 2026 ni qué pide.
- No se confirmó en Meta la fecha de baja de Embedded Signup v2.

## 6. Específico de Argentina y checklist con plazos

### Takeaway
No hay un trámite especial de WhatsApp para Argentina. Las particularidades son documentales: el CUIT y la constancia de ARCA (que reemplazó a AFIP en octubre de 2024), el riesgo de que Meta trate la constancia como "autogenerada", y la coincidencia exacta del nombre legal y del domicilio fiscal con el portfolio. Argentina tiene tarifa propia en la lista de precios de Meta y figura como país habilitado para Coexistence.

### Cited Findings
- ARCA reemplazó a AFIP en octubre de 2024: la constancia ahora se baja del portal de ARCA. Un CUIT marcado como "inactivo" o que "registra inconvenientes" puede estar suspendido. — vía buscador, [Lookuptax](https://lookuptax.com/docs/how-to-verify/cuit-argentina); [ARCA: Constancia de Inscripción](https://www.afip.gob.ar/genericos/cInscripcion/archivoCompleto.asp)
- **[BSP]** Para Argentina se pide la constancia de inscripción en AFIP/ARCA con CUIT, más un comprobante de domicilio. — [Aurora Inbox](https://www.aurorainbox.com/en/2026/05/14/what-is-meta-business-verification/)
- Meta exige que el nombre legal, la dirección y el teléfono coincidan con el documento. Si el idioma del documento no está admitido, pide una traducción al inglés con sello. — [Meta Business Help (es-la)](https://es-la.facebook.com/business/help/2342133782492969)
- La lista de precios de Meta trata a Argentina (+54) como mercado propio, separado de "Resto de Latinoamérica". — vía buscador, [Meta: Pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)
- **[BSP, sin confirmar]** Un proveedor da USD 0,0618 por plantilla de marketing en Argentina. Los valores para utilidad y autenticación no coinciden entre fuentes. — [Ominiflow [BSP]](https://ominiflow.com/whatsapp-api-pricing/argentina)
- **[BSP, sin confirmar]** Otro proveedor dice que desde el 1 de octubre de 2026 Meta cobra por mensaje también los de servicio en Cloud API para Argentina. — vía buscador, [Basework [BSP, Argentina]](https://www.basework.com.ar/blog/whatsapp-business-api-argentina). No se pudo leer la página (bloqueada) ni confirmarlo en Meta. **Es un dato importante para el modelo de costos: verificarlo aparte.**
- Coexistence figura como disponible en Argentina. — [Cliengo [BSP]](https://guiawabusiness.cliengo.com/coexistence); [Basework [BSP]](https://www.basework.com.ar/blog/conectar-whatsapp-api-coexistence)

### Inferences
**Checklist con plazos** (elaborado a partir de lo citado; los plazos de proveedores están marcados):

| # | Paso | Plazo estimado | Bloquea |
|---|---|---|---|
| 1 | CUIT activo y constancia de ARCA al día, con el domicilio fiscal correcto. Para una SAS: estatuto inscripto y CUIT de la sociedad | Horas si ya existe; la SAS, aparte | Verificación |
| 2 | Sitio con HTTPS en un dominio propio, con la marca, el nombre legal y la dirección en el pie, y email `@dominio` | 1 día | Verificación y nombre visible |
| 3 | Cuenta personal de Facebook con 2FA; portfolio comercial con el nombre legal **idéntico** al del documento | Minutos | — |
| 4 | App de Meta (tipo Business) con WhatsApp; usar el número de prueba o un número 555 | Minutos | — |
| 5 | SIM prepaga nueva → agregarla a la WABA → código por SMS o voz → **registrarla por API** (con PIN si todavía corresponde) | El mismo día | — |
| 6 | Medio de pago en la WABA (para plantillas con el número real) | Minutos | Plantillas pagas |
| 7 | Plantillas de utilidad (aprobación automática o rápida) | Minutos a horas (sin fuente de Meta en esta sesión) | Mensajes iniciados por el negocio |
| 8 | **Operar con 250 usuarios únicos por día y 2 números** sin verificar | Desde el día 1 | — |
| 9 | Iniciar la verificación del negocio con la constancia o el estatuto; tener un documento alternativo listo | Hasta 14 días hábiles según Meta (1 a 5 según proveedores); contar 2 a 4 semanas con un reintento | 2.000, 20 números, más WABAs, OBA, Tech Provider |
| 10 | Revisión del nombre visible (arranca después del paso 9) | 1 a 3 días hábiles según proveedores | — |
| 11 | Fase 2: App Review (2 permisos, 2 videos) → Tech Provider → Embedded Signup v4 (+ Coexistence) | Sin dato confiable | Alta de talleres |

- **¿Monotributo o SAS?** Para la fase 1 alcanza con monotributo, porque no hace falta verificar. Para verificar y para ser Tech Provider, una SAS reduce dos riesgos: que el nombre legal no coincida con la marca y que la constancia se considere "autogenerada". Además, tener el portfolio a nombre de la sociedad facilita después cambiar de titular o sumar socios. **Si la SAS se va a constituir en los próximos meses, conviene crear el portfolio directamente a su nombre**, para no verificar dos veces.

### Gaps
- Plazos actuales para constituir una SAS: no se investigaron y quedan fuera de alcance.
- Falta confirmar en Meta el cambio de precios del 1 de octubre de 2026 para los mensajes de servicio en Argentina.
- No se encontraron relatos de desarrolladores argentinos (foros, Reddit, dev.to) de 2025-2026 sobre la verificación con constancia de ARCA; la búsqueda solo devolvió guías de proveedores.
