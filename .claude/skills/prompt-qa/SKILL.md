---
name: prompt-qa
description: Escribir el prompt para que un agente de navegador haga QA de una feature en el preview o en producción. Usar después de que el dueño mergea un PR con cambios visibles.
---

# Prompt de QA para un agente de navegador

El QA lo hace un agente de navegador que maneja el dueño. Vos escribís el prompt; el dueño se lo pasa al agente y después te trae el reporte.

## Estructura del prompt

1. **Contexto:** qué se mergeó y para qué sirve, en dos o tres líneas, con el número de PR y la spec.
2. **Dónde:** la URL del preview o de producción, y con qué cuenta entrar. El dueño ya inició sesión: **el agente no escribe contraseñas**.
3. **Reglas de seguridad.** Van siempre, textuales y al principio:
   - No hagas pagos ni cambies planes.
   - No pidas ni escribas claves, tokens ni secretos en el chat.
   - No escribas contraseñas. Si una pantalla pide una, frená y avisá.
4. **Preparación:** qué datos de prueba crear o usar. Nombres claramente de prueba, por ejemplo "QA – Panadería de prueba".
5. **Pasos numerados.** Cada uno con:
   - la acción, concreta: dónde hacer clic y qué escribir;
   - el resultado esperado, observable: qué texto, qué número o qué cambio tiene que aparecer.

   Cubrí el flujo feliz, los errores y validaciones, mobile si aplica y los criterios de aceptación de la spec.
6. **Formato del reporte:**
   - una línea por paso: `N. OK` o `N. FALLA: qué pasó`;
   - capturas de lo que falle;
   - observaciones aparte: lo que no es una falla pero llama la atención (textos raros, demoras, algo confuso).

## Reglas

- **Español rioplatense y pasos que se puedan seguir sin conocer el código.**
- **No asumas datos que el agente no tiene.** Si un paso necesita algo previo, como un sitio con widget instalado o una conversación marcada, ponelo en la preparación.
- **Si un paso deja datos que ensucian** (conversaciones de prueba, leads), agregá al final cómo limpiarlos sin efectos para el visitante.
- **Cuando llegue el reporte:**
  - Cada FALLA se reproduce y se arregla con test, en un PR de `fix/`.
  - Las observaciones se discuten con el dueño antes de cambiar nada.
  - Si una observación revela algo que conviene recordar, va a `AGENTS.md`.
