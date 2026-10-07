# 003 — Widget embebible

- **Estado:** Aprobada (2026-10-02)
- **ADRs relacionados:** [0001 — Estrategia de modelos de IA](../adr/0001-estrategia-de-modelos-de-ia.md), [0003 — Arquitectura y límites del widget](../adr/0003-arquitectura-del-widget.md)

## Problema

El onboarding le pide al dueño que pegue `<script src=".../widget.js">` en su sitio, pero ese archivo no existe: hoy el script queda roto y el bot no aparece. Falta la pieza que hace visible el producto: un chat en el sitio del cliente que responda con la información del negocio.

## Historias de usuario

- Como **visitante de un sitio**, quiero abrir un chat, hacer una consulta y recibir la respuesta en segundos, sin registrarme.
- Como **visitante**, quiero que la conversación siga ahí si recargo la página o paso a otra sección del sitio.
- Como **dueño del negocio**, quiero que el chat tenga mis colores, mi ícono y mi mensaje de bienvenida, y que nadie más pueda usar mi bot en su sitio.
- Como **dueño**, quiero que el paso "Instalá el bot" del onboarding se complete solo cuando el chat aparece en mi sitio.
- Como **equipo de BrAInance**, queremos un techo de costo por sitio aunque alguien abuse del chat.

## Criterios de aceptación

### Carga e instalación

1. **Dado** un sitio que pegó el snippet con un `data-domain-id` válido, **cuando** carga la página, **entonces** aparece un botón de chat abajo a la derecha. Abrirlo no cambia el diseño ni los estilos del sitio, y el sitio tampoco altera los del chat.
2. **Dado** un `data-domain-id` inexistente o mal formado, **cuando** carga la página, **entonces** no se muestra nada y el script deja un aviso en la consola del navegador. La página del sitio no tiene errores.
3. **Dado** que el chat se abre embebido desde el dominio del sitio (o un subdominio), **cuando** se carga por primera vez, **entonces** el paso 3 del onboarding queda completo sin que el dueño confirme nada.
4. **Dado** otro sitio que pega el snippet con el id de un sitio ajeno, **cuando** carga la página, **entonces** el navegador bloquea el chat y no se registra la instalación.

### Conversación

5. **Dado** el chat abierto, **entonces** muestra el ícono, los colores y el mensaje de bienvenida configurados por el dueño. Si no configuró nada, usa los valores de BrAInance. Todos los textos de la interfaz están en español.
6. **Dado** una consulta del visitante, **cuando** la envía, **entonces** la respuesta aparece a medida que se genera (streaming), con la lógica de la spec 001: solo información del negocio y derivación al contacto si no sabe.
7. **Dado** una conversación con mensajes previos, **cuando** el visitante pregunta algo que depende de lo anterior ("¿y los sábados?"), **entonces** el bot usa el contexto de los últimos 10 mensajes.
8. **Dado** un visitante que recarga la página o navega a otra página del mismo sitio, **cuando** abre el chat, **entonces** ve la conversación anterior.
9. **Dado** cualquier intercambio, **entonces** quedan guardados el mensaje del visitante y la respuesta (`ChatMessage`), dentro de una conversación (`ChatRoom`) del visitante anónimo (`Customer`) de ese sitio.
10. **Dado** un error del modelo o de la red, **cuando** falla la respuesta, **entonces** el visitante ve un mensaje de error en español y puede reenviar. El mensaje que escribió no se pierde.
11. **Dado** un celular, **cuando** el visitante abre el chat, **entonces** ocupa la pantalla completa y se puede cerrar.

### Límites

12. **Dado** un mensaje de más de 1.000 caracteres, **entonces** no se envía y el chat indica el límite.
13. **Dado** un visitante que envió 20 mensajes en los últimos 10 minutos, **cuando** envía otro, **entonces** no se llama al modelo y el chat le pide que espere unos minutos.
14. **Dado** un sitio que recibió 300 mensajes de visitantes en las últimas 24 horas, **cuando** llega otro, **entonces** no se llama al modelo y el bot responde con el contacto del negocio.

## Fuera de alcance

- Captura de leads y preguntas de calificación (ítem 7 del roadmap).
- Toma de control humana en tiempo real y bandeja de conversaciones (ítem 8). El modelo de datos queda listo para eso.
- Recuperación con embeddings: el bot recibe la base de conocimiento completa, como en la spec 001.
- Archivos adjuntos, otros idiomas y elegir la posición del botón.

## Notas técnicas

**Piezas**
- `public/widget.js`: script en JavaScript plano, sin dependencias y de unos 2 KB. Toma el origen de su propio `src`, lee `data-domain-id`, pide la configuración pública del sitio y, si existe, agrega el botón y un iframe oculto hacia `/widget/[domainId]`. El tamaño (cerrado, abierto, pantalla completa en celular) se ajusta con `postMessage`, validando el origen.
- `/widget/[domainId]`: página de Next con el chat en React. Se agrega a `isPublicRoute`.
- `GET /api/widget/[domainId]/config`: ícono, colores, mensaje de bienvenida. Es público y cacheable.
- `GET /api/widget/[domainId]/conversation?visitorId=…` y `POST /api/widget/[domainId]/messages`: historial y envío con streaming (AI SDK `streamText`).
- `src/server/ai/answer.ts` suma `streamAnswer`, que comparte el prompt con `answerQuestion`. El modelo sale de `AI_ANSWER_MODEL` (por defecto `anthropic/claude-haiku-4.5`).
- Hasta que la configuración del bot (ítem 3 del roadmap) guarde un canal de contacto, el bot deriva a "los canales de contacto que figuran en este sitio" y trata al visitante de vos.

**Seguridad** (ver ADR 0003)
- La página del iframe responde con `Content-Security-Policy: frame-ancestors https://<dominio> https://*.<dominio>`. Así el navegador impide que otro sitio embeba el bot de un cliente.
- La instalación se marca (`ChatBot.installedAt`) cuando `widget.js` pide la configuración desde una página cuyo `Origin` coincide con el dominio o un subdominio. Los navegadores siempre envían `Origin` en pedidos entre sitios y no se puede falsificar desde una página. Esto permite crear el iframe recién cuando el visitante abre el chat.
- El visitante se identifica con un `visitorId` aleatorio de 128 bits generado en el iframe y guardado en su `localStorage`. Los navegadores particionan ese almacenamiento por sitio, así que cada sitio tiene su propia conversación. Funciona como una credencial: sin él no se puede leer el historial.
- Los límites se calculan en la base, sin infraestructura nueva: se cuentan los mensajes de visitantes por `visitorId` y por sitio en la ventana de tiempo. Los valores quedan en constantes de `src/domain/widget-limits.ts`.

**Datos**
- `Customer.visitorId String?` con `@@unique([domainId, visitorId])`. Un `ChatRoom` por visitante.
- Índice en `ChatMessage(chatRoomId, createdAt)` para el historial y los conteos.

## Riesgos y preguntas abiertas

- **Navegadores que bloquean el almacenamiento en iframes de terceros** (modo estricto de algunos navegadores): la conversación dura solo lo que la pestaña. Es aceptable para la beta.
- **Sitios que no usan HTTPS** quedan fuera de `frame-ancestors` (se exige `https://`). Para probar en local, en desarrollo se permite también `http://localhost`.
- **El tope por sitio es global**: un abusador puede agotar el cupo diario de un negocio. El límite por visitante lo mitiga; si pasa en la beta, se agrega límite por IP.

- **Campo deshabilitado mientras carga** (QA de la spec 011, 2026-10-07): el campo de texto espera a que el chat termine de cargar, porque lo que se escribe antes se borraría. Como no se veía deshabilitado, el visitante escribía y el texto se perdía. Desde entonces muestra "Cargando el chat…" con el estilo de deshabilitado, y el cursor pasa al campo apenas funciona. El iframe se crea cuando el visitante abre el chat, así que eso no le quita el foco al sitio.

## Plan de tests

| Criterio | Tipo de test | Archivo |
|---|---|---|
| 3, 4 (reglas de dominio) | Unitario: `frame-ancestors` y coincidencia de `Referer` con dominio y subdominios | `src/domain/widget-origin.test.ts` |
| 12, 13, 14 | Unitario: decisión de límites | `src/domain/widget-limits.test.ts` |
| 7 | Unitario: ventana de historial | `src/domain/widget-limits.test.ts` |
| 8, 9, 13, 14 | Integración (Postgres): visitante → conversación → mensajes, y conteos por visitante y por sitio | `src/server/conversations.int.test.ts` |
| 6, 10 | Unitario de `streamAnswer` con modelo mock | `src/server/ai/answer.test.ts` |
| 1, 2, 5, 6, 8, 11 | E2E: una página de prueba en otro origen pega el snippet, abre el chat, conversa (modelo mock), recarga y ve el historial; también en viewport de celular | `e2e/widget.spec.ts` |
| 3, 4 | E2E: la página del dominio correcto marca la instalación; un origen ajeno queda bloqueado | `e2e/widget.spec.ts` |

Los E2E usan un modelo mock (`AI_ANSWER_MODEL=mock/echo`, que solo se habilita fuera de producción) para no depender de un proveedor de IA ni gastar en cada corrida.
