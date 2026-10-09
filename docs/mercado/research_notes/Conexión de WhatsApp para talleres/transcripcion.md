# Transcripción de notas de voz de WhatsApp (español rioplatense, talleres mecánicos)

Notas de investigación al 9 de octubre de 2026. Alcance: elegir proveedor de speech-to-text para notas de voz OGG/Opus de 10 s a 2 min, grabadas por mecánicos en talleres ruidosos, con jerga ("tren delantero", "homocinética", "embrague", "bujías", "pastillas de freno"), modelos ("Gol", "Hilux", "Corsa") y patentes ("AB123CD", "ABC123"). Stack: Next.js en Vercel con Vercel AI SDK y AI Gateway.

**Limitaciones del método (importante para quien redacte el informe):**

- El proxy de red de esta sesión bloqueó la lectura directa de casi todas las páginas oficiales de precios (openai.com, deepgram.com, assemblyai.com, elevenlabs.io, groq.com, vercel.com, ai-sdk.dev, artificialanalysis.ai, arxiv.org). Los precios salen de resúmenes de búsqueda que citan páginas oficiales o agregadores; cuando la fuente es un agregador, lo marco. Todos los precios hay que reconfirmarlos en la página oficial antes de decidir.
- Lo que sí está verificado de primera mano es el lado del AI SDK y del AI Gateway: leí la documentación y los tipos de los paquetes npm publicados (`ai@7.0.126`, que es el instalado en el repo, y las últimas versiones de `@ai-sdk/gateway@4.0.110`, publicada el 2026-10-09, `@ai-sdk/openai@4.0.91`, `@ai-sdk/deepgram@3.1.29`, `@ai-sdk/assemblyai@3.0.58`, `@ai-sdk/elevenlabs@3.0.59`, `@ai-sdk/groq@4.0.59`, `@ai-sdk/gladia@3.0.58`, `@ai-sdk/google-vertex@5.0.109`, `@ai-sdk/azure@4.0.99` y `@ai-sdk/mistral@4.0.62`).

## 1. Candidatos: precio, locales de español, vocabulario, formatos, límites, latencia y privacidad

### Takeaway
A este volumen, todos los proveedores administrados cuestan menos de USD 2 por taller al mes, así que el precio no decide; deciden la calidad en audio real y la integración. Los que mejor combinan sesgo de vocabulario fuerte, OGG/Opus directo y español son AssemblyAI Universal-3.5 Pro (keyterms de hasta 1.000 palabras y un prompt de contexto), Deepgram Nova-3 (`es`/`es-419` y keyterm), ElevenLabs Scribe v2, OpenAI gpt-transcribe (palabras clave y contexto) y MAI-Transcribe-2 (phraseList, a USD 0,10/h promocional y disponible en el AI Gateway). Solo Azure lista `es-AR` como locale explícito. Ningún proveedor publica WER para español argentino.

### Cited Findings

**OpenAI (whisper-1, gpt-4o-transcribe, gpt-4o-mini-transcribe, gpt-transcribe, gpt-realtime-whisper)**
- Precios estimados por minuto: gpt-4o-transcribe ≈ USD 0,006/min (USD 6 por 1M de tokens de audio) y gpt-4o-mini-transcribe ≈ USD 0,003/min (USD 3 por 1M) según los precios de lanzamiento; whisper-1 cuesta USD 0,006/min. Un agregador chequeado en octubre de 2026 coincide — [VentureBeat](https://venturebeat.com/ai/openais-new-voice-ai-models-gpt-4o-transcribe-let-you-add-speech-to-your-existing-text-apps-in-seconds); [CostGoat (Oct 2026)](https://costgoat.com/pricing/openai-transcription)
- **Sucesor de 2026:** gpt-transcribe, para archivos completos y trabajo por lotes, a USD 0,0045/min según la página de precios de OpenAI, citada por terceros. gpt-realtime-whisper, para streaming, cuesta USD 0,017/min. También hay un gpt-live-transcribe de streaming a USD 0,017/min — [OpenAI Pricing](https://developers.openai.com/api/docs/pricing); [OpenAI model page gpt-transcribe](https://developers.openai.com/api/docs/models/gpt-transcribe); [OpenAI model page gpt-realtime-whisper](https://developers.openai.com/api/docs/models/gpt-realtime-whisper); [OpenRouter](https://openrouter.ai/openai/gpt-transcribe)
- gpt-transcribe y gpt-live-transcribe se lanzaron el 28 de julio de 2026 (OpenRouter dice 5 de agosto; las fuentes no coinciden) — [OpenAI Developer Community](https://community.openai.com/t/gpt-live-transcribe-and-gpt-transcribe-two-new-transcription-models-in-the-api/1388318); [Spokenly](https://spokenly.app/blog/gpt-transcribe)
- gpt-transcribe "soporta contexto no estructurado, pistas de palabras clave y múltiples pistas de idioma" para mejorar términos de dominio. Según un tercero, eso se mapea a los campos `prompt`, `keywords` y `languages` del mismo endpoint. OpenAI dice que maneja frases cortas, números, terminología especializada y voz con ruido de fondo fuerte — [OpenAI model page](https://developers.openai.com/api/docs/models/gpt-transcribe); [OpenAI cookbook: migrar de Whisper a GPT-Transcribe](https://developers.openai.com/cookbook/examples/migrating_from_whisper_to_gpt_transcribe); [gpt-transcribe.org (tercero)](https://gpt-transcribe.org/model/gpt-transcribe)
- **Límite de archivo:** 25 MB, documentado en el cookbook de OpenAI y en Azure OpenAI. Un desarrollador reportó un tope de duración de 1.500 s para gpt-4o-transcribe; es un reporte de la comunidad, no documentación oficial — [OpenAI Cookbook](https://cookbook.openai.com/examples/speech_transcription_methods); [Microsoft Learn](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/transcribe-overview); [OpenAI Community](https://community.openai.com/t/gpt-4o-transcribe-audio-length-limits/1148374)
- **OGG/Opus, sin confirmar:** la documentación de n8n incluye `.ogg` entre los formatos aceptados (flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm), pero el cookbook de OpenAI lista solo mp3, mp4, mpeg, mpga, m4a, wav y webm. Hay usuarios que reportan que Opus en OGG funciona con whisper-1 — [n8n docs](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/audio-operations); [OpenAI Cookbook](https://cookbook.openai.com/examples/speech_transcription_methods); [openai/whisper discussion #799](https://github.com/openai/whisper/discussions/799)
- **Privacidad:** la tabla oficial de OpenAI indica que `/v1/audio/transcriptions` no se usa para entrenar, con retención por abuse monitoring "None", y que es elegible para Zero Data Retention. Terceros dicen que el ZDR requiere aprobación previa de OpenAI — [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data); [Humla (tercero)](https://humla.team/blog/openai-data-retention-policy)
- **Locale:** el parámetro `language` es ISO-639-1 (`es`), sin variante regional — [AI SDK OpenAI provider docs](https://ai-sdk.dev/providers/ai-sdk-providers/openai) (verificado en `@ai-sdk/openai@4.0.91/docs/03-openai.mdx`)

**Deepgram (Nova-3)**
- Nova-3 soporta español con los códigos `es` y `es-419` — [Deepgram blog: Nova-3 Spanish/French/Portuguese](https://deepgram.com/learn/deepgram-expands-nova-3-with-spanish-french-and-portuguese-support); [Deepgram Models & Languages](https://developers.deepgram.com/docs/models-languages-overview)
- Precios: el pregrabado (batch) de Nova-3 monolingüe sale USD 0,0043/min en pago por uso y USD 0,0036/min en el plan Growth. El streaming de lista sale USD 0,0077/min (monolingüe) y 0,0092/min (multilingüe), y hubo tarifas promocionales menores. Keyterm prompting es un add-on de USD 0,0013/min (pago por uso) o 0,0012/min (Growth). Todo esto viene de agregadores y las cifras no coinciden del todo — [diyai.io](https://diyai.io/ai-tools/speech-to-text/deepgram-pricing-2026/); [convertaudiototext.com](https://convertaudiototext.com/blog/deepgram-nova-3-explained); [happyrobot.ai](https://www.happyrobot.ai/hub/deepgram-pricing)
- **Keyterm:** el changelog de Deepgram fija un límite de 500 tokens (~100 palabras) y aclara que la versión multilingüe necesita un checkpoint nuevo. Keyterm no admite pesos ni intensificadores. Desde noviembre de 2025 funciona con `model=nova-3&language=multi` — [Deepgram changelog 2025-11-26](https://developers.deepgram.com/changelog/2025/11/26); [Deepgram changelog 2025-12-10](https://developers.deepgram.com/changelog/2025/12/10); [Deepgram changelog](https://developers.deepgram.com/changelog)
- **OGG/Opus:** Deepgram lista Ogg y Opus entre los formatos soportados — [Deepgram Supported Audio Formats](https://developers.deepgram.com/docs/supported-audio-formats)
- **Privacidad:** por defecto, las cuentas del API hospedado participan del Model Improvement Program. Para salir hay que mandar `mip_opt_out=true` en cada request, y según un empleado de Deepgram eso implica renunciar a un descuento del 50% por participar. El marketing de Deepgram, en cambio, habla de "zero retention after processing": son mensajes contradictorios — [Deepgram discussion #1292](https://github.com/orgs/deepgram/discussions/1292); [Deepgram MIP docs](https://developers.deepgram.com/docs/the-deepgram-model-improvement-partnership-program); [Deepgram compliance](https://deepgram.com/learn/standard-compliance-speech-to-text); [Humla (tercero)](https://humla.team/blog/deepgram-data-retention-policy)

**AssemblyAI (Universal-3.5 Pro, Universal-3 Pro, Universal-2, Slam-1)**
- Universal-3.5 Pro pregrabado cuesta ≈ USD 0,21/h y Universal-2, USD 0,15/h. El add-on de prompting sale USD 0,05/h y la diarización, USD 0,02/h. Las cifras vienen de terceros y de un fragmento de la página de precios — [Cekura (tercero)](https://www.cekura.ai/blogs/assemblyai-pricing); [transcribebee (tercero)](https://transcribebee.com/blog/assemblyai-pricing-real-costs); [AssemblyAI pricing](https://www.assemblyai.com/pricing)
- Universal-3.5 Pro cubre 18 idiomas con code-switching nativo, español incluido. Para el resto cae a Universal-2, que cubre 99 idiomas — [AssemblyAI docs Universal-3.5 Pro](https://www.assemblyai.com/docs/pre-recorded-audio/universal-3-5-pro); [AssemblyAI blog multilingual](https://www.assemblyai.com/blog/multilingual-speech-to-text-api)
- Keyterms prompting admite hasta 1.000 palabras o frases en Universal-3.5 Pro pregrabado (máximo 6 palabras por frase) y 200 en Universal-2 — [AssemblyAI Models](https://www.assemblyai.com/docs/getting-started/models)
- En el AI SDK, `keytermsPrompt` es un array de strings con un máximo de 6 palabras por frase, y `prompt` acepta contexto en lenguaje natural de hasta 1.500 palabras (solo en universal-3-pro, universal-3-5-pro y slam-1). También están `customSpelling` (reglas from→to) y `languageCode`. `wordBoost` está deprecado — [AI SDK AssemblyAI provider](https://ai-sdk.dev/providers/ai-sdk-providers/assemblyai) (verificado en `@ai-sdk/assemblyai@3.0.58`)
- **OGG/Opus:** AssemblyAI soporta explícitamente .ogg, .oga, .mogg y .opus, y recomienda mandar el audio en su formato nativo, sin transcodificar — [AssemblyAI Supported File Formats](https://docs.assemblyai.com/overview/supported-file-formats); [AssemblyAI downsampling guide](https://www.assemblyai.com/docs/pre-recorded-audio/guides/downsampling)
- **Privacidad:** en los planes pagos, la exclusión del entrenamiento se activa sola en la página Data Controls; los usuarios free no pueden excluirse. La exclusión no es retroactiva. En async, el TTL mínimo de los artefactos es 1 hora. El zero data retention existe solo para Streaming con la exclusión activa — [AssemblyAI Data retention and model training](https://www.assemblyai.com/docs/data-retention-and-model-training); [AssemblyAI Data Controls](https://www.assemblyai.com/docs/data-controls); [AssemblyAI support](https://support.assemblyai.com/articles/2240096256-does-assemblyai-offer-zero-data-retention)

**ElevenLabs (Scribe v2)**
- Scribe v2 batch cuesta USD 0,22/h, Scribe Realtime USD 0,39/h, keyterm prompting suma USD 0,05/h y entity detection o redacción, USD 0,07/h. El dato sale de la página oficial de precios del API, citada en el resumen de búsqueda — [ElevenLabs API pricing](https://elevenlabs.io/pricing/api); [The Rundown](https://www.therundown.ai/tools/scribe-v2)
- Keyterms: hasta 1.000 términos desde la actualización de marzo de 2026 (antes eran 100). Un tercero dice que se facturan al menos 20 s cuando hay más de 100 keyterms; está sin verificar — [ElevenLabs magazine (tercero)](https://elevenlabsmagazine.com/elevenlabs-scribe-v2-speech-to-text-guide-2026/); [speechtotext.dev](https://speechtotext.dev/model/elevenlabs-scribe-v2/)
- **OGG/Opus:** el API batch acepta AAC, AIFF, OGG, MP3, OPUS, WAV, FLAC, M4A y WebM. El realtime acepta solo PCM o μ-law — [ElevenLabs help: audio formats](https://help.elevenlabs.io/hc/en-us/articles/15754340124305-What-audio-formats-do-you-support); [ElevenLabs STT docs](https://elevenlabs.io/docs/overview/capabilities/speech-to-text)
- **Privacidad:** por defecto, el audio puede usarse para mejorar modelos salvo que el usuario se excluya. El Zero Retention Mode es solo para Enterprise — [Opper (tercero)](https://opper.ai/provider/elevenlabs); [companyscope (tercero)](https://companyscope.io/vendors/elevenlabs); [ElevenLabs privacy policy](https://elevenlabs.io/privacy-policy)
- **AI SDK:** en `@ai-sdk/elevenlabs@3.0.59`, las opciones batch (`languageCode`, `tagAudioEvents`, `numSpeakers`, `diarize`, `fileFormat`, `timestampsGranularity`) no incluyen keyterms. El esquema `keyterms` (máximo 50 términos de hasta 20 caracteres) aparece solo en las opciones de streaming — [AI SDK ElevenLabs provider](https://ai-sdk.dev/providers/ai-sdk-providers/elevenlabs) (verificado en la documentación y en `dist/index.js` del paquete)

**Google Cloud Speech-to-Text (Chirp 2 / Chirp 3)**
- Precio: el reconocimiento estándar de la v2 sale USD 0,016/min para los primeros 500.000 min/mes, facturado en incrementos de 15 s. El dynamic batch (resultado en hasta 24 h) sale entre USD 0,003 y 0,004/min; las fuentes no coinciden en esa cifra — [tokenprice.fyi (agregador, 5 de octubre de 2026)](https://tokenprice.fyi/models/cloud-speech-to-text-chirp-3); [opentranscription.io](https://opentranscription.io/blog/google-cloud-chirp-3-capabilities-architecture-costs-and-com.html); [brasstranscripts](https://brasstranscripts.com/blog/google-cloud-speech-to-text-pricing-2025-gcp-integration-costs)
- **Locales:** Chirp 3 lista en GA Spanish (Spain) `es-ES` y Spanish (United States) `es-US`. No encontré `es-AR` en Chirp 2 ni en Chirp 3, aunque la lista de Preview no se vio completa. En Chirp 2, `es-419` aparece solo como origen de traducción — [Chirp 3 docs](https://docs.cloud.google.com/speech-to-text/docs/models/chirp-3); [Chirp 2 docs](https://docs.cloud.google.com/speech-to-text/docs/models/chirp-2)
- La speech adaptation (biasing con frases) está en GA para Chirp 3 — [Chirp 3 docs](https://docs.cloud.google.com/speech-to-text/docs/models/chirp-3)
- **Límites con el AI SDK:** la API síncrona transcribe hasta 1 minuto o 10 MB por request. Las notas de hasta 2 min superan ese tope. Chirp 3 está solo en las multirregiones `us` y `eu`, y las API keys de Express Mode no sirven para transcripción. El provider expone `languageCodes`, puntuación, offsets de palabra y región, pero no expone adaptación — [AI SDK Google Vertex provider](https://ai-sdk.dev/providers/ai-sdk-providers/google-vertex) (verificado en `@ai-sdk/google-vertex@5.0.109`)

**Google Gemini 3.5 Transcribe (vía AI Gateway)**
- Lanzado el 26 de agosto de 2026, según Vercel. OpenRouter dice 25 de septiembre. Cubre más de 85 idiomas con detección automática y code-switching. En el AI Gateway cuesta USD 2 por 1M de tokens de entrada y USD 12 por 1M de salida; la versión Live, USD 0,54/h. Spokenly estima ≈ USD 0,005/min para batch (es una estimación, no un precio oficial) — [Vercel AI Gateway: Gemini 3.5 Transcribe](https://vercel.com/ai-gateway/models/gemini-3.5-transcribe); [Vercel: Gemini 3.5 Transcribe Live](https://vercel.com/ai-gateway/models/gemini-3.5-transcribe-live); [Vercel changelog](https://vercel.com/changelog/gemini-3-5-transcribe-now-available-on-ai-gateway); [Spokenly (tercero)](https://spokenly.app/blog/gemini-3-5-transcribe)

**Azure AI Speech (es-AR, Custom Speech, MAI-Transcribe-2)**
- `es-AR` figura en la tabla de idiomas de Azure Speech, con soporte de Custom Speech (texto plano, texto estructurado y pronunciación) — [Azure Speech language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support)
- Las phrase lists sirven en tiempo de ejecución, sin entrenamiento, en real-time y en fast transcription, "para locales donde la función está habilitada". No confirmé que `es-AR` sea uno de ellos — [Azure phrase list docs](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/improve-accuracy-phrase-list)
- **Precio de fast transcription (conflictivo):** respuestas en Microsoft Q&A hablan de ≈ USD 0,66/h (East US, noviembre de 2025). Un blog de 2026 dice USD 1,00/h en real-time estándar y USD 0,18/h en batch — [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5634306/how-much-is-the-pricing-of-using-the-diarization-a); [brasstranscripts](https://brasstranscripts.com/blog/azure-speech-services-pricing-2025-microsoft-ecosystem-costs)
- **MAI-Transcribe-2:** cuesta USD 0,10/h como oferta por tiempo limitado hasta el 31/12/2026, y no hay precio posterior publicado. La versión streaming cuesta USD 0,54/h. Cubre 60 idiomas y tiene keyword biasing (`phraseList.phrases`), que no existe en la versión streaming — [Microsoft Tech Community](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/mai-transcribe-2-highest-quality-transcription-at-the-fastest-speed-and-lowest-c/4550972); [MAI-Transcribe-2 Model Card](https://microsoft.ai/pdf/MAI-Transcribe-2-Model-Card.pdf); [Microsoft Learn MAI-Transcribe](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/mai-transcribe); [Vercel AI Gateway MAI-Transcribe 2](https://vercel.com/ai-gateway/models/mai-transcribe-2)
- Un medio publicó "USD 9 por 1.000 minutos" (USD 0,54/h) para MAI-Transcribe-2. Probablemente confunde la versión streaming; la contradicción no está resuelta — [247wallst](https://247wallst.com/cards/xpost-01m3w4y0437j5c973nhq0kt8m7)
- **AI SDK Azure:** `azure.transcription('mai-transcribe-2')` admite `phraseList.phrases`, `locales` (exactamente un código, por ejemplo `['es']`), `transcribeStyle: 'clean'` y diarización. Requiere un recurso en `centralindia`, `eastus`, `northeurope`, `southeastasia`, `westus` o `westus2` — [AI SDK Azure provider](https://ai-sdk.dev/providers/ai-sdk-providers/azure) (verificado en `@ai-sdk/azure@4.0.99`)

**Groq (Whisper hospedado)**
- whisper-large-v3-turbo cuesta USD 0,04/h y whisper-large-v3, USD 0,111/h, con un mínimo de 10 s facturados por request. El archivo puede pesar hasta 25 MB en el plan free y 100 MB en el dev, y se puede pasar por URL — [Groq model page](https://console.groq.com/docs/model/whisper-large-v3-turbo); [Groq STT docs](https://console.groq.com/docs/speech-to-text); [eesel (tercero)](https://www.eesel.ai/blog/groq-pricing)
- **Privacidad:** por defecto, Groq no retiene datos de inferencia, pero `/openai/v1/audio/transcriptions` tiene hasta 30 días de retención para confiabilidad y abuse monitoring, y es elegible para ZDR — [Groq: Your Data](https://console.groq.com/docs/your-data)
- **AI SDK:** las opciones son `prompt` (texto para guiar el estilo, en el idioma del audio) y `language` ISO-639-1. No hay keyterms — [AI SDK Groq provider](https://ai-sdk.dev/providers/ai-sdk-providers/groq) (verificado en `@ai-sdk/groq@4.0.59`)

**Gladia (Solaria)**
- El plan Starter (pago por uso) cuesta USD 0,61/h async, con €50 de crédito y 10 h gratis. El Growth sale "desde USD 0,20/h async" según Gladia, aunque otro agregador da USD 0,50/h. Incluye diarización, NER y code-switching sin costo extra — [Gladia blog](https://www.gladia.io/blog/speechmatics-vs-gladia); [toolradar (tercero)](https://toolradar.com/tools/gladia)
- Tiene custom vocabulary aplicado en inferencia, con variantes de pronunciación. Solaria-3 está optimizado para EN, FR, DE, ES e IT. Ambas afirmaciones son de Gladia — [Gladia custom vocabulary](https://www.gladia.io/blog/custom-vocabulary-for-ai-meeting-note-takers); [Gladia Solaria-3](https://www.gladia.io/blog/solaria-3-speech-to-text-model-for-european-languages)
- **AI SDK:** las opciones incluyen `contextPrompt`, `customVocabulary` y `customVocabularyConfig` (con `intensity` y `pronunciations` por término), además de `customSpelling` — [AI SDK Gladia provider](https://ai-sdk.dev/providers/ai-sdk-providers/gladia) (verificado en `@ai-sdk/gladia@3.0.58`)

**Speechmatics**
- Los precios publicados por terceros son muy dispares: "desde USD 0,30/h" con plan free; Melia-1 a USD 0,24/h y Enhanced a 0,75/h; o USD 0,80 a 1,04/h en batch. La versión enterprise se cotiza a pedido — [spotsaas](https://www.spotsaas.com/product/speechmatics/pricing); [Gladia blog (competidor)](https://www.gladia.io/blog/speechmatics-vs-gladia)
- No existe un provider oficial `@ai-sdk/speechmatics` en npm (lo consulté el 2026-10-09). Solo hay SDKs propios de Speechmatics, como `@speechmatics/real-time-client` — [npm @speechmatics/real-time-client](https://www.npmjs.com/package/@speechmatics/real-time-client)

**Mistral Voxtral (alternativa que figura en el AI SDK)**
- `mistral.transcription('voxtral-mini-latest')` admite `contextBias` con hasta 100 palabras o frases, sin espacios (se usan guiones bajos), y diarización. Solo funciona en batch — [AI SDK Mistral provider](https://ai-sdk.dev/providers/ai-sdk-providers/mistral) (verificado en `@ai-sdk/mistral@4.0.62`)

**Whisper large-v3 / turbo autohospedado**
- El costo marginal es de USD 0,007 a 0,17 por hora de audio con turbo en int8, según la GPU (una RTX A5000 rinde 38× tiempo real a USD 0,0071/h de audio). Una L40S a USD 0,75/h da ≈ USD 0,025 por hora de audio — [Salad blog](https://blog.salad.com/whisper-large-v3/); [Spheron](https://www.spheron.network/blog/faster-whisper-gpu-cloud-production-deployment-guide/)
- Una RTX 3090 se alquila a ≈ USD 0,193/h — [nexgpu](https://nexgpu.net/en/models/whisper/)

### Inferences
- **Tabla de síntesis** (precios a octubre de 2026, de las fuentes de arriba; "AI SDK" quiere decir que hay provider oficial y "Gateway", que hay un ID tipado en `@ai-sdk/gateway@4.0.110`):

| Proveedor / modelo | USD por hora de audio | Español regional | Vocabulario | OGG/Opus directo | AI SDK / Gateway |
|---|---|---|---|---|---|
| OpenAI gpt-transcribe | ≈0,27 | `es` | prompt + keywords (keywords no está en el AI SDK) | probable, sin confirmar | SDK con string ID; no está tipado en el Gateway |
| OpenAI gpt-4o-transcribe | ≈0,36 | `es` | prompt | probable, sin confirmar | SDK + Gateway |
| OpenAI gpt-4o-mini-transcribe | ≈0,18 | `es` | prompt | probable, sin confirmar | SDK + Gateway |
| Deepgram Nova-3 (+ keyterm) | ≈0,26 + 0,08 | `es`, `es-419` | keyterm (~100 palabras) | sí | SDK (keyterm único); no está en el Gateway |
| AssemblyAI Universal-3.5 Pro | ≈0,21 (+0,05 si usa prompt) | `es` | keyterms (1.000), prompt, customSpelling | sí | SDK; no está en el Gateway |
| ElevenLabs Scribe v2 | 0,22 (+0,05 keyterms) | `es` | keyterms (1.000; no en batch del SDK) | sí | SDK; solo realtime en el Gateway (según la documentación) |
| Azure MAI-Transcribe-2 | 0,10 (promoción hasta el 31/12/2026) | `es` (un locale) | phraseList | sin confirmar | SDK (Azure) + Gateway |
| Azure Speech estándar/fast | ≈0,66–1,00 | `es-AR` explícito | phrase list, Custom Speech | sin confirmar | no (otro API) |
| Google Chirp 3 | 0,96 (estándar), 0,18–0,24 (batch de 24 h) | `es-US`/`es-ES` | adaptation (no expuesta en el SDK) | sin confirmar | SDK (Vertex; sync ≤1 min) |
| Gemini 3.5 Transcribe | ≈0,30 (estimado por tokens) | más de 85 idiomas | sin datos | sin confirmar | Gateway |
| Groq whisper-large-v3-turbo | 0,04 | `es` | prompt | sin confirmar | SDK; no está en el Gateway |
| Gladia | 0,20–0,61 | `es` | custom vocabulary con intensidad | sin confirmar | SDK |
| Speechmatics | 0,24–1,04 | sin datos | sin datos | sin datos | no |
| Whisper autohospedado | ≈0,01–0,03 de marginal + GPU ociosa | `es` | prompt | sí (ffmpeg) | no |

- Una nota de 2 minutos en Opus pesa unos pocos cientos de KB (deducido del bitrate típico de Opus para voz; no lo verifiqué con WhatsApp). Ningún tope de 25 MB a 100 MB es un problema. La excepción es la API síncrona de Google: corta en 1 minuto, así que las notas largas necesitan otro camino.
- La latencia no debería pesar en la decisión: la nota llega completa y el usuario espera una respuesta por WhatsApp, no subtítulos en vivo. Conviene un modelo batch (pregrabado) y no uno de streaming, que cuesta 2 a 4 veces más (Scribe 0,22 contra 0,39 USD/h; gpt-transcribe 0,0045 contra 0,017 USD/min).
- Deepgram es el único caso donde la privacidad encarece el servicio: salir del MIP puede duplicar el precio de lista. En OpenAI y en AssemblyAI pago, no entrenar es lo estándar o se activa sin costo.

### Gaps
- No pude abrir ninguna página oficial de precios (las bloqueó el proxy de egreso). Todos los precios son de resúmenes de búsqueda y agregadores, con fecha de octubre de 2026 en el mejor caso. Hay que confirmarlos antes del ADR.
- No confirmé si Deepgram cobra distinto el español monolingüe que el multilingüe, ni si `es-419` cuesta lo mismo que `es`.
- No confirmé el soporte de OGG/Opus en Google Chirp, Azure (fast transcription y MAI), Groq, Gladia ni gpt-transcribe.
- No encontré la lista de idiomas por locale de MAI-Transcribe-2 ni de gpt-transcribe (esta tendría unos 22 idiomas según los benchmarks de lanzamiento), ni si distinguen variantes regionales.
- No investigué la privacidad de Google, Azure, Gladia y Speechmatics.
- No encontré mediciones independientes de latencia de punta a punta para archivos cortos (10 s a 2 min). OpenAI no publica latencia de gpt-transcribe; un tercero dice "~34× tiempo real" sin método.

## 2. Integración con Vercel AI SDK y AI Gateway

### Takeaway
`transcribe()` del AI SDK funciona con unos 15 providers. El AI Gateway enruta transcripción, pero solo para un subconjunto: en `@ai-sdk/gateway@4.0.110` están OpenAI (whisper-1, gpt-4o-transcribe, gpt-4o-mini-transcribe), MAI-Transcribe-2, Gemini 3.5 Transcribe, Fish Audio, xAI Grok STT y los modelos realtime. Deepgram, AssemblyAI, Groq y Gladia necesitan su propio paquete `@ai-sdk/*`, una API key y facturación aparte. Además, algunos providers no exponen todo el sesgo de vocabulario del API nativo.

### Cited Findings
- `transcribe({ model, audio })` acepta `Uint8Array`, `ArrayBuffer`, `Buffer`, base64 o `URL`. Devuelve `text`, `segments`, `language` y `durationInSeconds`, admite `providerOptions`, `abortSignal`, `headers` y telemetría, y tira `NoTranscriptGeneratedError`. Para URLs descarga hasta 2 GiB por defecto (`createDownload` lo ajusta). `experimental_streamTranscribe` es experimental — [AI SDK Core: Transcription](https://ai-sdk.dev/docs/ai-sdk-core/transcription) (verificado en `node_modules/ai/docs/03-ai-sdk-core/36-transcription.mdx`, `ai@7.0.126`, que es la versión del repo)
- La tabla de modelos de esa página incluye OpenAI (whisper-1, gpt-4o-transcribe, gpt-4o-mini-transcribe, gpt-4o-transcribe-diarize), ElevenLabs (scribe_v1, scribe_v2, scribe_v2_realtime), Groq (whisper-large-v3, whisper-large-v3-turbo), Mistral (voxtral-mini-latest), Azure (whisper-1, gpt-4o(-mini)-transcribe, mai-transcribe-2, mai-transcribe-1.5), Rev.ai, Deepgram (base, enhanced, nova, nova-2, nova-3), Gladia, AssemblyAI (universal-3-5-pro, universal-3-pro), Fal (whisper, wizper), Google Vertex (chirp_2, chirp_3, telephony), xAI, Cartesia y Fish Audio — [AI SDK Core: Transcription](https://ai-sdk.dev/docs/ai-sdk-core/transcription)
- La documentación dice: "String model IDs resolve through the global provider (AI Gateway by default). AI Gateway supports streaming transcription for supported models (e.g. `openai/gpt-realtime-whisper`, `elevenlabs/eleven-scribe-2-realtime`, `xai/grok-stt`)" — [AI SDK Core: Transcription](https://ai-sdk.dev/docs/ai-sdk-core/transcription)
- `GatewayTranscriptionModelId` en `@ai-sdk/gateway@4.0.110` (publicado el 2026-10-09) es `'fish-audio/transcribe-1' | 'google/gemini-3.5-transcribe' | 'google/gemini-3.5-transcribe-live' | 'microsoft/mai-transcribe-2' | 'microsoft/mai-transcribe-2-streaming' | 'openai/gpt-4o-mini-transcribe' | 'openai/gpt-4o-transcribe' | 'openai/gpt-realtime-whisper' | 'openai/whisper-1' | 'spacexai/grok-stt' | (string & {})`. Las versiones anteriores del changelog registran "feat(provider/gateway): add speech and transcription model support" y el streaming de transcripción — [npm @ai-sdk/gateway](https://www.npmjs.com/package/@ai-sdk/gateway) (tipos en `dist/index.d.ts` y `CHANGELOG.md`)
- Changelog de Vercel: "Realtime voice, speech, and transcription now supported on AI Gateway" (29 de junio; el año, 2026, es una inferencia), Microsoft AI models en el Gateway, Gemini 3.5 Transcribe en el Gateway y streaming de transcripción en beta — [Vercel changelog](https://vercel.com/changelog/realtime-voice-speech-and-transcription-now-supported-on-ai-gateway); [Vercel changelog MAI](https://vercel.com/changelog/microsoft-ai-models-are-now-available-on-ai-gateway); [Vercel changelog streaming](https://vercel.com/changelog/ai-gateway-now-supports-streaming-transcription); [AI Gateway Speech Quickstart](https://vercel.com/docs/ai-gateway/getting-started/speech)
- Precios en el Gateway: MAI-Transcribe-2 cuesta USD 0,10 por hora de audio; gpt-4o-transcribe, USD 2,50 por 1M de tokens de entrada y USD 10 por 1M de salida; Gemini 3.5 Transcribe, USD 2 y 12 por 1M. Según Vercel, el Gateway cobra el precio de lista del proveedor sin markup, también con BYOK — [Vercel MAI-Transcribe 2](https://vercel.com/ai-gateway/models/mai-transcribe-2); [Vercel GPT-4o Transcribe](https://vercel.com/ai-gateway/models/gpt-4o-transcribe); [Vercel AI Gateway](https://vercel.com/ai-gateway)
- ZDR en el Gateway: la opción `zeroDataRetention` enruta solo a proveedores con acuerdo de ZDR con Vercel. Las credenciales BYOK se saltean salvo que estén marcadas como ZDR, y el ZDR por request está disponible solo en los planes Pro y Enterprise — [AI Gateway docs](https://vercel.com/docs/ai-gateway) (verificado en `@ai-sdk/gateway/docs/00-ai-gateway.mdx`)
- **Limitaciones de los providers (inspección de los paquetes del 2026-10-09):**
  - `@ai-sdk/deepgram@3.1.29` define `keyterm: z.string().nullish()` y manda un solo parámetro `keyterm` en la query. No expone `mip_opt_out` para transcripción (solo para speech).
  - `@ai-sdk/openai@4.0.91` tipa `whisper-1`, `gpt-4o-(mini-)transcribe`, `gpt-4o-transcribe-diarize` y `gpt-realtime-whisper`, pero no `gpt-transcribe`. Sus opciones de transcripción son `prompt`, `language`, `temperature`, `include`, `responseFormat` y `chunkingStrategy`; no hay `keywords` ni `languages`.
  - `@ai-sdk/elevenlabs@3.0.59` no expone keyterms en batch.
  — [npm @ai-sdk/deepgram](https://www.npmjs.com/package/@ai-sdk/deepgram); [npm @ai-sdk/openai](https://www.npmjs.com/package/@ai-sdk/openai); [npm @ai-sdk/elevenlabs](https://www.npmjs.com/package/@ai-sdk/elevenlabs)
- El `package.json` del repo declara solo `"ai": "^7.0.126"` entre los paquetes del AI SDK; el provider del Gateway viene incluido en `ai` — [package.json del repo](../../../../package.json)

### Inferences
- **El camino de menor fricción** es un string ID del Gateway (`transcribe({ model: 'openai/gpt-4o-transcribe' | 'microsoft/mai-transcribe-2' | 'google/gemini-3.5-transcribe', audio: buffer })`). No suma dependencias, usa la key y la facturación que ya existen y deja cambiar de modelo para el eval tocando un string. Así se puede comparar OpenAI, MAI y Gemini sin contratar nada.
- **Para Deepgram, AssemblyAI, ElevenLabs con keyterms o Groq** hay que sumar el paquete `@ai-sdk/<proveedor>`, una variable de entorno nueva (que va documentada en `.env.example`) y un contrato aparte.
  - Si se usa Deepgram con varias keyterms o con `mip_opt_out`, hace falta un `fetch` propio que agregue los parámetros a la query, o llamar al REST directo.
  - Para el `keywords` de gpt-transcribe vale lo mismo, hasta que el provider lo soporte.
- `gpt-transcribe` con el string ID `openai/gpt-transcribe` o con `openai.transcription('gpt-transcribe')` tal vez funcione, porque los tipos aceptan `(string & {})`, pero no está tipado ni probado. Hay que verificarlo con una llamada real.
- La interfaz `transcribe()` es la misma para todos los providers. Un adaptador en `src/server/` detrás de una interfaz (como pide AGENTS.md) permite cambiar de proveedor sin tocar el dominio.

### Gaps
- No pude abrir las páginas de modelos del Gateway para confirmar si existe `openai/gpt-transcribe` o algún modelo de ElevenLabs batch, Deepgram o AssemblyAI que todavía no esté en los tipos.
- No sé si `zeroDataRetention` del Gateway cubre los modelos de transcripción, ni con qué proveedores de audio tiene Vercel acuerdos de ZDR.
- Hay una inconsistencia de nombres: la documentación del AI SDK usa `xai/grok-stt` y los tipos del Gateway, `spacexai/grok-stt`. No está resuelta.

## 3. Evidencia de calidad: español, Argentina/LatAm, ruido y acentos

### Takeaway
No hay ningún benchmark publicado, independiente ni de proveedor, que mida WER en español rioplatense con audio ruidoso y jerga técnica. Lo que existe son índices compuestos casi todos en inglés (Artificial Analysis), tablas de proveedores con un WER de español genérico (AssemblyAI, Deepgram, Microsoft, OpenAI y Gladia) y estudios académicos de sesgo por acento que confirman que el acento cambia el WER. La única forma confiable de elegir es un eval propio con notas de voz reales de talleres.

### Cited Findings
- **Artificial Analysis (independiente; fecha de la instantánea sin confirmar):** el AA-WER pondera unas 8 h de audio de tres datasets: AA-AgentTalk (50%), VoxPopuli-Cleaned-AA (25%) y Earnings22-Cleaned-AA (25%). No hay desglose por idioma. Los mejores en no-streaming fueron StepAudio 3 ASR (1,7%), MAI-Transcribe-2 (2,0%), ElevenLabs Scribe v2 (2,2%) y Grok Voice Transcribe 2.0 (2,3%), sobre 57 modelos. El mejor modelo de pesos abiertos es Voxtral Small (2,8%) — [Artificial Analysis STT non-streaming](https://artificialanalysis.ai/speech-to-text/non-streaming)
- **Open ASR Leaderboard (Hugging Face; independiente):** tiene un track multilingüe con CoVoST-2 y FLEURS que incluye español — [arXiv 2510.06961](https://arxiv.org/abs/2510.06961)
- **AssemblyAI (benchmark de proveedor):** en su tabla multilingüe, Universal-3.5 Pro da 6,57% de WER en español y Speechmatics Enhanced, 5,84%, así que AssemblyAI no lidera en español ni en su propia tabla. Scribe v2 tiene 11,13% de WER global en 19 de 20 idiomas, sin cifra para español — [AssemblyAI benchmarks](https://www.assemblyai.com/benchmarks)
- **Deepgram (benchmark de proveedor):** Nova-3 en español mejoró un 21,40% relativo el WER de streaming frente a Nova-2. El anuncio tiene unos 400 días. En Nova-3 Medical Multilingual, el español mejoró un 32% en batch, pero es dominio médico — [Deepgram blog](https://deepgram.com/learn/deepgram-expands-nova-3-with-spanish-french-and-portuguese-support); [Deepgram Nova-3 Medical Multilingual](https://deepgram.com/learn/introducing-nova-3-medical-multilingual)
- **Microsoft (benchmark de proveedor):** MAI-Transcribe-2 es "#1 en FLEURS" con un WER promedio de 5,2% en 60 idiomas, sin especificar el idioma. FLEURS es lectura de oraciones, no habla conversacional — [Microsoft AI news](https://microsoft.ai/news/mai-transcribe-2-is-the-fastest-most-accurate-and-cheapest-speech-recognition-model-in-the-world/); [análisis en note.com (tercero)](https://note.com/ai_driven/n/ne424db903ddb?hl=en)
- **OpenAI (benchmark de proveedor, citado por terceros):** en Common Voice con 22 idiomas, el WER bajó de 40,37% (whisper-1) a 19,27% (gpt-transcribe). En "Real-World Audio Recording" con nueve idiomas dio 9,60%, contra 11,65% de GPT-Realtime-Whisper-1 — [AlphaSignal](https://alphasignal.ai/news/openai-replaces-whisper-with-gpt-transcribe-slashing-errors-by-52); [OpenAI Developer Community](https://community.openai.com/t/gpt-live-transcribe-and-gpt-transcribe-two-new-transcription-models-in-the-api/1388318)
- **Mistral (paper de proveedor, 2025):** en la tabla FLEURS del paper de Voxtral, GPT-4o mini Transcribe da 2,58 de WER en español — [Voxtral, arXiv 2507.13264](https://arxiv.org/pdf/2507.13264)
- **Gladia (afirmación de proveedor):** Solaria tiene "top accuracy" en EN, ES, FR e IT en Common Voice y FLEURS — [Gladia Solaria](https://www.gladia.io/solaria)
- **Whisper large-v3 (terceros):** da ≈ 2,9% de WER en español en FLEURS, con una muestra chica de 50 frases por idioma. El paper Whisper-LM da 5,81 en Common Voice 13 con Whisper Large. Un fine-tune español de turbo (adriszmar/whisper-large-v3-turbo-es) reporta 6,91 → 5,34% en Common Voice — [vocova.app](https://vocova.app/blog/ai-transcription-accuracy-benchmark-2026); [Whisper-LM, arXiv 2503.23542](https://arxiv.org/pdf/2503.23542); [Hugging Face adriszmar](https://huggingface.co/adriszmar/whisper-large-v3-turbo-es)
- **Acento rioplatense (académico):** un estudio de MDPI de 2024 compara Alexa y Whisper por acento del español y tiene una categoría Austral (rioplatense). Whisper supera a Alexa en todos los acentos salvo el del sur de la península ibérica y en hombres, y el WER más alto en ciertos acentos sugiere sesgo — [MDPI Applied Sciences 14(11):4734](https://www.mdpi.com/2076-3417/14/11/4734)
- Un paper de 2022 sobre acentos del inglés y del español arma sets de evaluación con un subconjunto de Argentina de 19 h. Evalúa modelos propios, no Whisper ni APIs comerciales — [arXiv 2212.12048](https://ar5iv.labs.arxiv.org/html/2212.12048)
- **Trampas de medición en rioplatense:** la ortografía oculta el "sh" del ll/y, y Whisper escribe los números como dígitos, lo que infla el WER si no se normaliza — [rioplatense-tts-bench](https://github.com/dario248/rioplatense-tts-bench)
- Hay un proyecto comunitario de ASR rioplatense sobre whisper-large-v3-turbo, sin resultados publicados — [STT-ar](https://github.com/JNprog8/STT-ar)
- **Ruido:** Retell AI, una plataforma de voice agents (no es proveedor de ASR), midió en su set interno de llamadas ruidosas un 4,7% de WER para AssemblyAI Universal-3 Pro (5,6% de media); el idioma no está claro. Coval, un benchmark independiente en inglés, encontró que Deepgram Nova-3 y Nova-2, los más rápidos, tienen el WER más alto — [Retell AI blog](https://www.retellai.com/blog/best-speech-to-text-models); [Coval](https://www.coval.ai/blog/best-speech-to-text-providers-in-2026-independent-benchmarks-and-how-to-choose/)
- ESCUCHA (julio de 2026) es un benchmark de español con condiciones acústicas heterogéneas y varios acentos, pero evalúa comprensión con modelos de audio-lenguaje (preguntas de opción múltiple), no WER de transcripción — [arXiv 2607.17812](https://arxiv.org/abs/2607.17812); [Pith review](https://pith.science/paper/2607.17812)

### Inferences
- Los WER de español de los proveedores, entre 2% y 7% en FLEURS y Common Voice, son lectura limpia. Para notas de taller con ruido de compresor y amoladora, habla rápida y jerga, hay que esperar bastante más error, sobre todo en sustantivos raros ("homocinética", "cazoleta", "rótula") y en patentes. Un WER general bajo no garantiza acertar las entidades que importan: patente, modelo y repuesto.
- La métrica que sirve no es el WER global sino la **tasa de acierto de entidades**: patente exacta, modelo de auto, repuesto y monto. Eso calza con la cultura de evals del repo (ADR 0001, `evals/`). Propuesta: 50 a 100 notas reales o simuladas por mecánicos argentinos, con referencias normalizadas, comparando 4 o 5 candidatos con y sin vocabulario.
- Los candidatos para el eval, por evidencia y por integración:
  - gpt-transcribe y gpt-4o-transcribe (Gateway u OpenAI);
  - MAI-Transcribe-2 (Gateway, el más barato, 2,0% de AA-WER);
  - Gemini 3.5 Transcribe (Gateway);
  - AssemblyAI Universal-3.5 Pro (keyterms y prompt);
  - ElevenLabs Scribe v2 (2,2% de AA-WER);
  - Deepgram Nova-3 `es-419` + keyterm.

### Gaps
- No encontré ningún WER publicado para español argentino o rioplatense en ningún proveedor comercial.
- No encontré WER de español específico para gpt-transcribe, MAI-Transcribe-2, Scribe v2, Gemini 3.5 Transcribe ni Chirp 3. Las tablas por idioma del model card de MAI no se pudieron extraer.
- No pude confirmar la fecha de la instantánea de Artificial Analysis ni si incluye gpt-transcribe y Gemini 3.5 Transcribe.
- No encontré ninguna medición del efecto de keyterms o prompts en español (con frente a sin).

## 4. Recomendaciones prácticas para jerga y patentes

### Takeaway
Conviene trabajar en tres capas: (1) sesgar el ASR con una lista corta y por taller (repuestos frecuentes, modelos de auto, nombres de clientes y patentes ya cargadas) usando keyterms, prompt o phraseList; (2) que el LLM de extracción corrija y normalice con el catálogo del taller como contexto; y (3) validar las patentes con regex, compararlas de forma difusa contra el padrón del taller y confirmar por WhatsApp cuando haya ambigüedad.

### Cited Findings
- Mecanismos de vocabulario por proveedor:
  - OpenAI gpt-transcribe: contexto, keywords e idiomas.
  - OpenAI whisper-1 y gpt-4o: `prompt`, que "debe coincidir con el idioma del audio".
  - Deepgram: keyterm, hasta ~100 palabras y sin pesos.
  - AssemblyAI: keytermsPrompt (1.000), prompt (1.500 palabras) y customSpelling.
  - ElevenLabs: keyterms (1.000), sensibles al contexto según ElevenLabs.
  - Azure y MAI: phraseList.
  - Google Chirp 3: speech adaptation.
  - Gladia: custom vocabulary con intensidad y pronunciaciones.
  - Mistral: contextBias (100).
  — [OpenAI gpt-transcribe](https://developers.openai.com/api/docs/models/gpt-transcribe); [AI SDK OpenAI](https://ai-sdk.dev/providers/ai-sdk-providers/openai); [Deepgram changelog](https://developers.deepgram.com/changelog/2025/12/10); [AI SDK AssemblyAI](https://ai-sdk.dev/providers/ai-sdk-providers/assemblyai); [ElevenLabs magazine (tercero)](https://elevenlabsmagazine.com/elevenlabs-scribe-v2-speech-to-text-guide-2026/); [Microsoft Learn MAI](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/mai-transcribe); [Chirp 3 docs](https://docs.cloud.google.com/speech-to-text/docs/models/chirp-3); [AI SDK Gladia](https://ai-sdk.dev/providers/ai-sdk-providers/gladia); [AI SDK Mistral](https://ai-sdk.dev/providers/ai-sdk-providers/mistral)
- Microsoft trata las phrases como pistas de reconocimiento, no como salida forzada — [eesel (tercero)](https://www.eesel.ai/blog/mai-transcribe-2)
- **Formato de patentes en Argentina:**
  - Entre 1995 y 2016 se usó el formato de tres letras y tres números (ABC 123).
  - Desde abril de 2016, el formato Mercosur para autos es de dos letras, tres números y dos letras (AA 123 AA).
  - Para motos, el Mercosur usa una letra, tres números y tres letras (A 123 AAA). Su asignación actual no está confirmada.
  — [elcerokm](https://elcerokm.com/blog/como-se-leen-las-patentes-nuevas); [Infobae 2015](https://www.infobae.com/2015/09/17/1755971-la-nueva-patente-del-mercosur-ya-es-oficial-arranca-2016/); [Diario de Cuyo](https://diariodecuyo.com.ar/argentina/La-nueva-patente-del-Mercosur-arranca-en-2016-20150917-0035.html)
- Whisper normaliza los números a dígitos, y el WER depende mucho de la normalización — [rioplatense-tts-bench](https://github.com/dario248/rioplatense-tts-bench); [Whisper-LM](https://arxiv.org/pdf/2503.23542)
- AssemblyAI recomienda mandar el audio en su formato nativo, sin transcodificar. Si un OGG viene con headers rotos, se puede reempaquetar sin recodificar con `ffmpeg -i in.ogg -c:a copy out.ogg` — [AssemblyAI](https://www.assemblyai.com/docs/pre-recorded-audio/guides/downsampling); [chattopdf (tercero)](https://chattopdf.app/blog/whatsapp-audio-format)
- Un trabajo sobre habla española atípica (S-DiverSe) reporta que el post-procesamiento heurístico del texto es más robusto que el fine-tuning para habla fuera de dominio — [Pith: S-DiverSe](https://pith.science/paper/2607.03207)

### Inferences (diseño propuesto, no verificado empíricamente)
- **Vocabulario por request, dinámico por taller:**
  - Una base fija de 50 a 100 términos de mecánica rioplatense: tren delantero, homocinética, embrague, bujías, pastillas de freno, discos, amortiguadores, correa de distribución, bomba de agua, cazoleta, rótula, extremo de dirección, bieletas, buje, radiador, alternador, burro de arranque, tapa de cilindros, junta, service, VTV.
  - Más los modelos de auto del parque argentino: Gol, Corsa, Hilux, Ranger, Amarok, 208, Cronos, Etios, Clio, Kangoo, Partner, Sandero, Onix, Focus.
  - Más los nombres de los clientes y las patentes activas del taller.
  - El límite chico de Deepgram (~100 palabras) obliga a priorizar. AssemblyAI y ElevenLabs (1.000) admiten listas largas.
- **Prompt de contexto** (OpenAI, AssemblyAI, Gladia): una o dos frases del tipo "Nota de voz de un mecánico de un taller en Argentina, en español rioplatense. Menciona trabajos, repuestos, modelos de auto y patentes argentinas (formatos AA123AA o ABC123), deletreadas con nombres de letras." En el prompt, escribir las patentes ejemplo en el mismo formato en que se quieren de salida.
- **No confiar en el ASR para la patente:**
  - El LLM de extracción recibe la transcripción y la lista de patentes y vehículos del taller, y devuelve la patente normalizada (mayúsculas, sin espacios ni guiones) y una bandera de confianza.
  - La validación es determinística, con regex: autos Mercosur `^[A-Z]{2}\d{3}[A-Z]{2}$`, formato viejo `^[A-Z]{3}\d{3}$` y motos Mercosur `^[A-Z]\d{3}[A-Z]{3}$`.
  - Si no hay coincidencia exacta, se compara con distancia de edición contra el padrón del taller. Si la ambigüedad sigue, se pregunta "¿Es la AB123CD del Gol de Juan?" por WhatsApp.
- **Mapear letras dichas en voz alta:** "be larga", "be corta" o "ve corta", "doble ve", "i griega", "jota", "equis", "zeta", "eme de mamá", "ene de Nora", y los números dichos en grupos ("ciento veintitrés" → 123). Esto va en las instrucciones del LLM o en una función pura en `src/domain/` con tests.
- **Guardar el audio original y la transcripción cruda** (con TTL acorde a la política de privacidad) para depurar y para alimentar el eval.
- **Silencio:** Whisper y algunos modelos alucinan texto cuando hay silencio o ruido sin voz. Conviene descartar las notas casi vacías por duración o energía antes de transcribir, o pedirle al LLM que marque "sin contenido".

### Gaps
- No encontré ninguna medición de cuánto mejora el acierto de patentes deletreadas en español con keyterms o prompting en ningún proveedor.
- No confirmé el esquema vigente de patentes de motos ni otros formatos especiales (diplomáticas, oficiales).
- No encontré evidencia de cómo transcribe cada modelo las letras deletreadas en español ("be larga"), si las convierte o no a la letra suelta.

## 5. Costo mensual estimado por taller (10 notas/día × 30 s × 22 días)

### Takeaway
El volumen es de 110 minutos (≈ 1,83 h) de audio por taller al mes. Con los precios de octubre de 2026, el costo va de ≈ USD 0,07 (Groq turbo) a ≈ USD 1,76 (Google Chirp 3 estándar). Los candidatos fuertes quedan entre USD 0,18 y 0,66 por taller al mes, irrelevante frente al costo del LLM y del WhatsApp. Incluso con 100 talleres, la transcripción cuesta entre USD 18 y 66 por mes.

### Cited Findings
- Precios usados (ver la sección 1 para las fuentes):
  - OpenAI: gpt-4o-transcribe y whisper-1 a USD 0,006/min; gpt-transcribe a 0,0045/min; gpt-4o-mini-transcribe a 0,003/min — [OpenAI Pricing](https://developers.openai.com/api/docs/pricing); [CostGoat](https://costgoat.com/pricing/openai-transcription)
  - Deepgram Nova-3 batch: USD 0,0043/min en pago por uso y 0,0036/min en Growth, más keyterm a 0,0013 o 0,0012/min — [diyai.io](https://diyai.io/ai-tools/speech-to-text/deepgram-pricing-2026/)
  - AssemblyAI Universal-3.5 Pro: USD 0,21/h, más 0,05/h de prompting — [Cekura](https://www.cekura.ai/blogs/assemblyai-pricing)
  - ElevenLabs Scribe v2: USD 0,22/h, más 0,05/h de keyterms — [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
  - Google Chirp 3: USD 0,016/min en incrementos de 15 s, o 0,003–0,004/min en dynamic batch — [tokenprice.fyi](https://tokenprice.fyi/models/cloud-speech-to-text-chirp-3)
  - MAI-Transcribe-2: USD 0,10/h, promocional hasta el 31/12/2026 — [Vercel](https://vercel.com/ai-gateway/models/mai-transcribe-2)
  - Groq: turbo a USD 0,04/h y large-v3 a 0,111/h, con 10 s mínimos — [Groq](https://console.groq.com/docs/model/whisper-large-v3-turbo)
  - Gladia: USD 0,61/h en Starter y 0,20/h en Growth — [Gladia](https://www.gladia.io/blog/speechmatics-vs-gladia)
  - Gemini 3.5 Transcribe: ≈ USD 0,005/min, estimado — [Spokenly](https://spokenly.app/blog/gemini-3-5-transcribe)
  - Speechmatics: entre USD 0,24 y 1,04/h — [spotsaas](https://www.spotsaas.com/product/speechmatics/pricing)
- Una RTX 3090 cuesta ≈ USD 0,193/h si está siempre encendida — [nexgpu](https://nexgpu.net/en/models/whisper/)

### Inferences (cálculos propios: 110 min = 1,833 h por taller al mes)

| Opción | USD/taller/mes | USD/100 talleres/mes |
|---|---|---|
| Groq whisper-large-v3-turbo | 0,07 | 7 |
| MAI-Transcribe-2 (promoción hasta el 31/12/2026) | 0,18 | 18 |
| Groq whisper-large-v3 | 0,20 | 20 |
| gpt-4o-mini-transcribe | 0,33 | 33 |
| Gladia Growth | 0,37 | 37 |
| AssemblyAI U-3.5 Pro | 0,39 (0,48 con prompt) | 39 (48) |
| ElevenLabs Scribe v2 | 0,40 (0,50 con keyterms) | 40 (50) |
| Deepgram Nova-3 batch, pago por uso | 0,47 (0,62 con keyterm) | 47 (62) |
| gpt-transcribe | 0,50 | 50 |
| Gemini 3.5 Transcribe (estimado) | ≈0,55 | ≈55 |
| gpt-4o-transcribe / whisper-1 | 0,66 | 66 |
| Gladia Starter | 1,12 | 112 |
| Deepgram con salida del MIP (si duplica el precio; sin verificar) | ≈1,1–1,2 | ≈110–120 |
| Azure fast transcription estándar (≈0,66/h) | 1,21 | 121 |
| Google Chirp 3 estándar | 1,76 | 176 |
| Whisper autohospedado con GPU siempre encendida | ≈141 fijo (RTX 3090 × 730 h) | ≈141 fijo hasta saturar la GPU |

- El mínimo de 10 s de Groq y los incrementos de 15 s de Google no afectan a notas de 30 s. Sí encarecen las notas muy cortas: una de 5 s se cobra como 10 s o 15 s.
- El autohospedaje no tiene sentido a esta escala. Una GPU siempre encendida cuesta lo mismo que unos 200 talleres con gpt-4o-transcribe, y suma operación. Solo serviría con GPU serverless o con miles de talleres.
- **Conclusión de costo:** el precio no diferencia a los candidatos. Conviene elegir por la tasa de acierto de entidades en el eval propio y por la simplicidad de integración (Gateway). El precio de MAI-Transcribe-2 es promocional hasta el 31/12/2026 y no se puede proyectar más allá.

### Gaps
- Los precios no se confirmaron en las páginas oficiales por el bloqueo del proxy. Gemini 3.5 Transcribe y gpt-4o-transcribe en el Gateway se cobran por tokens, así que el costo por minuto es una estimación.
- No sé cuál será el precio de MAI-Transcribe-2 después del 31/12/2026.
- No incluí el costo del LLM de extracción ni del almacenamiento del audio.
