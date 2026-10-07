# Refutación del hueco "honestidad operativa" (lente: LatAm, España y herramientas nativas de Meta/Google)

- Fecha: 2026-10-07
- Rol del agente: escéptico. Objetivo: refutar con evidencia verificada en vivo la afirmación de que nadie cubre el hueco para un micro-negocio argentino.
- Búsquedas realizadas: 8 (WebSearch). Los sitios de los proveedores están bloqueados por el proxy; la evidencia sale de fragmentos de búsqueda y de páginas de terceros (Capterra, blogs, docs públicas).
- Veredicto: **NO refutado** (`refuted=false`, `verified_live=true`), con matices importantes.

## El hueco bajo examen

> Honestidad operativa como promesa central: "responde solo con lo que vos cargaste; cuando no sabe, no inventa y te deriva a tu WhatsApp o teléfono", con una métrica pública que lo demuestre.

Para marcarlo como refutado hacía falta un contraejemplo concreto: producto + URL que (a) venda esa promesa como titular, (b) apunte a micro-negocios argentinos, (c) a precio cero o comparable a una beta gratuita, y (d) publique una métrica que lo demuestre. Ningún candidato cumple las cuatro.

## Candidatos encontrados y por qué no refutan

### 1. Meta Business AI / agente de IA en WhatsApp Business (el más peligroso)

- Fuentes: https://www.coderhouse.com/ar/coderlibrary/meta-agente-ia-whatsapp-business-latam ; https://www.diegoceredi.com/blog/ia-vende-sola-whatsapp-business-argentina ; https://www.infogastronomica.com.ar/whatsapp-business-como-funciona-el-agente-de-ia-que-ahora-te-respondera-siempre-y-que-promete-aumentar-las-ventas/
- Qué cubre: habilitado en Argentina (expansión a 17 países de LatAm, 1 de julio de 2026), integrado a la cuenta de WhatsApp Business, responde preguntas frecuentes sobre horarios, precios, stock y envíos, se configura con el contexto del negocio (catálogo, políticas) y "límites" (qué responde solo y cuándo transfiere a una persona). Gratis para el negocio y apunta exactamente al público de BrAInance (comercios y locales chicos).
- Por qué no refuta: el canal es WhatsApp, no el sitio web; el titular de Meta es "vende más / responde siempre", no "no inventa"; no hay métrica pública de derivaciones ni eval publicado; la propia prensa recomienda "mantener validación humana" porque el agente puede responder cosas sensibles (plazos, descuentos). Cubre el mecanismo (contexto + escalado), no la promesa.
- Matiz: es la amenaza estructural más grande. El micro-negocio argentino vive en WhatsApp, Meta lo da gratis y podría agregar un fallback tipo "no tengo ese dato, te paso con el negocio" en una actualización. El widget web solo es defendible mientras el negocio tenga tráfico web propio.

### 2. Cliengo (Argentina, pymes LatAm)

- Fuentes: https://guiawabusiness.cliengo.com/responder-automaticamente-whatsapp ; https://guiawabusiness.cliengo.com/que-es-agente-ia-whatsapp ; https://www.capterra.com.ar/reviews/158756/cliengo ; https://www.capterra.com/p/158756/Cliengo/
- Qué cubre: agente IA sobre base de conocimiento (catálogo, FAQ, políticas, precios), "responde con la información correcta, no respuestas prefijadas", escala al humano con resumen e intención detectada, CRM nativo, widget web y WhatsApp. Es el competidor local más directo.
- Por qué no refuta: la promesa central es ventas ("califica al lead y solo pasa al humano lo que vale la pena"), no honestidad. En Capterra (4,3/5, 13 reseñas) aparece "suele equivocarse al contestar en automático", "cobros fantasma" y quejas por aumentos de precio. Planes pagos, sin métrica pública de derivaciones ni eval.

### 3. eesel AI (contenido en español para España)

- Fuentes: https://www.eesel.ai/es/blog/why-your-ai-chatbot-is-not-answering-correctly ; https://www.eesel.ai/es/blog/crisp-chatbot-ia
- Qué cubre: es el único que vende explícitamente "anclado en tu conocimiento, entrenado únicamente con tus artículos" como argumento anti-alucinación.
- Por qué no refuta: producto en inglés, orientado a equipos de soporte con helpdesk (Zendesk, Intercom, Slack), precio por interacción, no apunta a micro-negocios ni ofrece la derivación a WhatsApp/teléfono como salida por defecto. Lo publica en un blog, no en el titular ni con una métrica.

### 4. Crisp, Aivo, Botmaker (LatAm / Europa)

- Fuentes: https://www.eesel.ai/es/blog/crisp-chatbot-ia ; https://www.capterra.ae/software/180934/aivo ; https://www.cbinsights.com/compare/botmaker-vs-chatmeai
- Crisp: IA en el plan Essentials (USD 95/mes), rastrea el sitio y PDFs; para startups, no para una panadería. Aivo: desde USD 240/mes, 1.000 sesiones, mid-market. Botmaker: argentino desde 2016, plataforma omnicanal para empresas, sin precio público para micro-negocios.
- Ninguno vende "no inventa" como titular ni publica tasa de derivación.

### 5. Métrica de derivaciones ("handoff rate")

- Fuentes: https://docs.ada.cx/measure-overview ; https://docs.cognigy.com/insights/dashboards/live-agent/ ; https://docs.cloud.google.com/contact-center/insights/docs/virtual-agent-platform?hl=es-419 ; https://aunoa.ai/blog/como-medir-el-exito-de-un-chatbot-con-ia/
- La métrica existe y está estandarizada (handoff rate, containment rate, "respuestas no encontradas") en Ada, Cognigy y Google CCAI, es decir, en plataformas enterprise. Aunoa (España) la recomienda a pymes como KPI interno.
- No refuta: nadie la expone al dueño de un micro-negocio en un dashboard simple ni la publica como prueba de producto. Pero desmiente la idea de que sea "un número que nadie mide": es un KPI conocido; lo inédito es publicarlo y ponerlo en el titular.

### 6. Precios de referencia en España (contexto)

- Fuentes: https://www.javadex.es/blog/agentes-ia-atencion-cliente-pymes-espana-precios-2026 ; https://www.upliora.es/blog/coste-agentes-ia-pymes-espana-2026
- SaaS 2026: Intercom Fin ~0,99 €/resolución; Zendesk AI 1,50–2,00 €/resolución; Tidio Lyro desde 0,58 €/conversación; Freshdesk Freddy ~0,50 €/sesión. Agente a medida: 5.000–12.000 € de implantación + 50–300 €/mes. Ninguno a precio micro-negocio; confirma que "no cobrar por una derivación" es una diferencia real frente a Fin y Zendesk.

## Conclusión del escéptico

1. **El mecanismo no es un hueco.** RAG sobre datos del negocio + fallback + escalado a humano es estándar en Cliengo, Meta Business AI, eesel, Lyro y Crisp. Si la landing solo dice "responde con tus datos", no diferencia nada.
2. **La promesa como titular + métrica pública sí es un hueco, pero chico y frágil.** Es posicionamiento, no tecnología: cualquier competidor puede copiar el titular en una semana. Lo que es más difícil de copiar es el eval set publicado en español y la coherencia de pricing (no cobrar derivaciones).
3. **El riesgo n.º 1 es Meta, no Cliengo.** Gratis, nativo en el canal donde ya está el público, y en Argentina desde julio de 2026. La defensa del widget web depende de que el negocio tenga sitio con tráfico y de que Meta no agregue un fallback honesto por defecto.
4. **"No inventa" es una promesa que se puede usar en contra.** Con el precedente de Air Canada, publicar "no inventa" y fallar el eval expone a reclamos. La redacción de la landing tiene que ser verificable ("responde solo con lo que cargaste; lo que no está, lo deriva") y el número publicado tiene que salir del eval, no del marketing.

## Qué habría que chequear a mano (no verificable por el proxy)

- Landing actual de Cliengo y Tidio Lyro: si en 2026 ya subieron "no inventa" al titular.
- Documentación de Meta Business AI: si la configuración de "límites" incluye un mensaje de fallback con contacto del negocio y si reporta tasa de transferencia a humano.
- Chatbase y Tidio: si el dashboard muestra "unanswered questions" al dueño (Chatbase lo tenía como listado, no como porcentaje).

## Búsquedas realizadas (8)

1. chatbot IA para pymes Argentina "no inventa" responde solo con tu información deriva a WhatsApp
2. Cliengo chatbot IA "no inventa" respuestas base de conocimiento derivación WhatsApp pymes
3. Meta AI WhatsApp Business "Business AI" responde preguntas pequeños negocios Argentina 2026 no sabe transfiere humano
4. chatbot IA sin alucinaciones pymes España "solo responde" con tu contenido "si no sabe" deriva agente humano precio
5. Meta "agente de IA" WhatsApp Business inventa respuestas "no sabe" límites opiniones pymes Argentina gratis
6. Cliengo precio plan agente IA 2026 pesos dólares reseñas "alucina" OR "inventa" OR "respuestas incorrectas"
7. chatbot "porcentaje de derivaciones" OR "tasa de escalado" OR "handoff rate" dashboard chatbot sitio web pymes "respuestas no encontradas" métrica
8. Botmaker OR "Aivo" OR "Treble" OR "Chatwoot" OR "Crisp" chatbot IA pequeño negocio precio mensual Argentina widget web "no inventa" OR "sin alucinaciones"
