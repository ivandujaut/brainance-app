# Refutación del hueco "español rioplatense con voseo y plantillas de FAQ por rubro" (lente: LatAm, España y herramientas nativas de Meta/Google)

- Fecha: 2026-10-07
- Rol del agente: escéptico. Objetivo: refutar con evidencia verificada en vivo la afirmación de que nadie cubre este hueco para un micro-negocio argentino.
- Búsquedas realizadas: 8 (WebSearch). Los sitios de los proveedores están bloqueados por el proxy; la evidencia sale de fragmentos de búsqueda y de páginas de terceros (comparativas, blogs, centros de ayuda, prensa).
- Veredicto: **NO refutado** (`refuted=false`, `verified_live=true`), con matices importantes: la mitad del hueco (plantillas por rubro) ya existe en varios productos, y la otra mitad (voseo) es trivial de copiar porque cualquier LLM lo hace con una instrucción.

## El hueco bajo examen

> Español rioplatense con voseo y contexto de barrio como feature declarada, con plantillas de FAQ por rubro (panadería, taller, consultorio, inmobiliaria, gimnasio, contador).

Para marcarlo como refutado hacía falta un contraejemplo concreto: producto + URL que, para un micro-negocio argentino con widget web y a precio de beta gratuita / unos pocos dólares, (a) declare el voseo o el español argentino como feature, y (b) traiga plantillas de FAQ por rubro de barrio listas para editar. Ningún candidato cumple las dos; varios cumplen una parte.

## Candidatos encontrados y por qué no refutan

| Producto | Qué cubre del hueco | Qué no cubre | Fuente |
|---|---|---|---|
| **Chat Nube (Tiendanube)** | Asistente de IA "nativo para e-commerce en Latinoamérica", disponible en Argentina, con "tono de voz del asistente totalmente personalizado según la identidad de la marca". Es el producto local más cercano a "habla como tu marca". | No declara voseo ni español argentino: habla de "tono de marca", genérico para AR, BR, MX, CO y CL. Solo WhatsApp y solo tiendas Tiendanube (no widget en sitio propio, no consultorio ni taller). Sin plantillas de FAQ por rubro. | https://ayuda.tiendanube.com/es_AR/responde-con-chat-nube/por-que-elegir-chat-nube-frente-a-la-ia-de-whatsapp-business · https://www.publimetro.co/estilo-vida/2025/06/13/asistente-virtual-con-inteligencia-artificial-transforma-el-comercio-conversacional-en-latinoamerica/ |
| **Kommo** (ex amoCRM) | 6 plantillas de chatbot gratuitas por industria: salón de belleza/peluquería/barbería (FAQ, turnos, confirmaciones), inmobiliaria (califica compradores y deriva a una persona), entre otras. Es el contraejemplo más fuerte para la parte de "plantillas por rubro". | Plantillas de flujo para WhatsApp dentro de un CRM, no de FAQ en lenguaje natural para un widget web. Español neutro. No cubre panadería, taller, consultorio ni contador. Producto para equipos de ventas, no para un dueño solo. | https://www.kommo.com/es/blog/plantillas-de-chatbot-para-diferentes-industrias/ |
| **Jotform AI Agents** | 18 plantillas de chatbot de IA en español, con casos de rubro como "pedidos de panadería" y "cancelación de membresía de gimnasio". | Plantillas traducidas de un catálogo en inglés, pensadas para formularios y pedidos, no para FAQ de un negocio argentino (medios de pago, horario cortado, obra social). Español neutro, sin voseo. | https://www.jotform.com/es/ai/chatbot/templates/ · https://jotform.com/es/agent-templates/category/bakery-order-ai-agents |
| **Elfsight AI Chatbot widget** | Widget web embebible con plantillas por industria (e-commerce, salud, hostelería, finanzas). | Plantillas de sector genérico, no de rubro de barrio. Producto global en inglés traducido; sin voseo declarado. | https://elfsight.com/es/ai-chatbot-widget/features/ |
| **Tidio** | Artículo en español con plantillas de chatbot por caso de uso. | Es contenido de blog (plantillas de flujo), no onboarding por rubro. Español peninsular/neutro. Precio y créditos de IA ya analizados en el informe de precio plano. | https://www.tidio.com/es/blog/plantillas-para-chatbot |
| **Órbita** (La Plata) | IA argentina para consultorios: responde consultas frecuentes, da turnos y deriva a una persona cuando lo requiere. Es exactamente el rubro "consultorio" del hueco, hecho desde Argentina. | Solo WhatsApp, solo salud; en prueba en consultorios según Ámbito, sin precio público ni autoservicio. No hay evidencia de voseo declarado como feature ni de otros rubros. | https://www.ambito.com/tecnologia/desarrollo-nacional-crearon-una-ia-argentina-que-organiza-turnos-medicos-whatsapp-y-ya-se-prueba-consultorios-n6304027/amp |
| **Cliengo** (Buenos Aires) | "Agente IA entrenado en español latinoamericano"; planes desde USD 45/mes. | La búsqueda específica ("Cliengo" + voseo/rioplatense/argentino) no devolvió ninguna página de Cliengo que mencione el voseo: su mensaje es "latinoamericano", no "argentino". Sin plantillas de FAQ por rubro visibles. | https://guiawabusiness.cliengo.com/mejores-chatbots-whatsapp · https://guiawabusiness.cliengo.com/mejores-agentes-ia-whatsapp |
| **Botmaker** (Argentina) | Agente de IA generativa multicanal, local. | Clientes como Ford Argentina y Carrefour; sin plantillas de rubro ni voseo como feature; precio fuera de escala (ver informe de precio plano). | https://duotach.com/blog/mejores-chatbots-whatsapp-argentina |
| **Meta Business Agent (WhatsApp)** | Disponible en Argentina vía WhatsApp Business; responde con el catálogo y la info del negocio. | Ninguna fuente lo describe con tono argentino configurable ni con plantillas por rubro. Solo WhatsApp. | (ver informe de precio plano; esta búsqueda no agregó evidencia nueva) |
| **Google** | — | Google Business Messages fue discontinuado en 2024; no apareció ningún producto nativo de Google de chat con IA para sitios de pymes. | (sin resultados) |

## Por qué el hueco se achica igual

1. **El voseo no es una capacidad escasa: es una línea de prompt.** La guía de Coderhouse para pymes argentinas lo dice sin vueltas: GPT-4, Claude y Gemini "tienen muy buen desempeño en español latinoamericano, incluyendo modismos locales, y se puede configurar el tono y el dialecto deseado en las instrucciones del sistema del bot" (https://www.coderhouse.com/ar/coderlibrary/crear-chatbot-ia-negocio-sin-programar-2026). Cualquier competidor con campo "instrucciones" (Cliengo, Chat Nube, Chatbase, Tidio) le permite al dueño escribir "hablá de vos". Lo que no hacen es **declararlo** ni **garantizarlo por defecto**; ahí está la diferencia, y es de marketing y de QA (el eval en rioplatense), no de tecnología.
2. **Mantener el voseo de forma consistente tiene un costo real.** Un changelog de un proyecto open source (gentle-ai v1.18.4) documenta un bug donde expresiones rioplatenses sueltas en los assets ("acordate", "dale") hacían que el LLM pasara a voseo cuando no correspondía (https://newreleases.io/project/github/Gentleman-Programming/gentle-ai/release/v1.18.4). El problema inverso (bot que mezcla "tú" y "vos" o que se "españoliza" a mitad de conversación) es el que hay que cubrir con el eval y lo que sirve de demo: "mirá cómo responde".
3. **"Plantillas por rubro" ya es una categoría conocida.** Kommo, Jotform, Elfsight y Tidio la usan como argumento de venta. La diferenciación no puede ser "tenemos plantillas" sino "plantillas de FAQ de barrio argentino": obra social y matrícula en el consultorio, horario cortado y pago con transferencia en la panadería, seña y presupuesto en el taller, expensas y garantía en la inmobiliaria, monotributo en el contador. Ninguna de las plantillas encontradas tiene ese nivel de localización.
4. **El rubro "consultorio" ya tiene un jugador argentino.** Órbita hace FAQ + turnos + derivación para consultorios, por WhatsApp. Si BrAInance apunta a consultorios, compite con un producto vertical hecho en el país; la ventaja de BrAInance es el widget web y cubrir varios rubros con una misma herramienta, no la profundidad en salud.
5. **El sustituto por tono es Chat Nube para quien ya tiene Tiendanube.** Un local de ropa con tienda en Tiendanube ya tiene un asistente que "habla como la marca" en pesos. Para ese segmento, BrAInance tiene que argumentar el sitio propio fuera de Tiendanube o aceptar que el local de ropa no es el mejor público inicial.

## Qué habría que verificar todavía

- Si **Cliengo** o **Chat Nube** tienen un selector de tono con opción "argentino / voseo" dentro del producto (los sitios están bloqueados; la búsqueda indexada no lo muestra, pero puede existir en la UI).
- Si **Meta Business Agent** en Argentina adopta el registro del negocio (vos/tú) a partir de las conversaciones previas del dueño.
- Precio y disponibilidad real de **Órbita** para un consultorio chico.
- Si **Kommo** o **Jotform** agregaron plantillas en español para panadería, taller o contador después de la fecha de los artículos encontrados.

## Veredicto para el plan

El hueco sigue abierto como **combinación declarada** (voseo garantizado + plantillas de FAQ de barrio por rubro + widget web), pero las dos piezas por separado son copiables en semanas por Cliengo o Chat Nube. Conviene ejecutarlo rápido, publicar el eval en rioplatense como prueba y hacer que las plantillas sean visiblemente argentinas (vocabulario de medios de pago, obra social, horario cortado) para que el "nosotros también tenemos plantillas" de un global no alcance.

## Fuentes consultadas (todas las búsquedas)

- https://www.coderhouse.com/ar/coderlibrary/crear-chatbot-ia-negocio-sin-programar-2026
- https://www.coderhouse.com/coderlibrary/atencion-cliente-ia-chatbots-voicebots-agentes-argentina
- https://www.jotform.com/es/ai/chatbot/templates/
- https://jotform.com/es/agent-templates/category/bakery-order-ai-agents
- https://www.kommo.com/es/blog/plantillas-de-chatbot-para-diferentes-industrias/
- https://elfsight.com/es/ai-chatbot-widget/features/
- https://www.tidio.com/es/blog/plantillas-para-chatbot
- https://newreleases.io/project/github/Gentleman-Programming/gentle-ai/release/v1.18.4
- https://www.polyglottistlanguageacademy.com/language-culture-travelling-blog/2025/3/16/argentinian-spanish-how-it-differs-from-other-spanish-varieties
- https://ayuda.tiendanube.com/es_AR/responde-con-chat-nube/por-que-elegir-chat-nube-frente-a-la-ia-de-whatsapp-business
- https://ayuda.tiendanube.com/es_AR/123515-aplicaciones-de-atencion-al-cliente/responder-a-mis-clientes-automaticamente-con-el-asistente-inteligente-de-ia
- https://www.publimetro.co/estilo-vida/2025/06/13/asistente-virtual-con-inteligencia-artificial-transforma-el-comercio-conversacional-en-latinoamerica/
- https://mercado.com.ar/protagonistas/tiendanube-invierte-10-millones-de-dolares-en-ia/
- https://www.innovaciondigital360.com/i-a/chatbots-ai-empresas-argentina/
- https://yo-facturo.com/blog/bot-whatsapp-argentina-ia/
- https://duotach.com/blog/mejores-chatbots-whatsapp-argentina
- https://guiawabusiness.cliengo.com/mejores-chatbots-whatsapp
- https://www.comparasoftware.com/chatbot/articulos/bots-whatsapp-2026
- https://developargentina.com/blog/chatbot-whatsapp-argentina-implementar-empresa-2026
- https://www.ambito.com/tecnologia/desarrollo-nacional-crearon-una-ia-argentina-que-organiza-turnos-medicos-whatsapp-y-ya-se-prueba-consultorios-n6304027/amp
- https://developargentina.com/blog/chatbots-ia-empresas-argentina-guia-2026
- https://blog.chattigo.com/chatbots/casos-de-éxito-hospital-el-cruce
- https://dealism.ai/es/ai-customer-agent-clinic
