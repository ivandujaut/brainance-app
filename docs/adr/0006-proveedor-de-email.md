# 0006 — Proveedor de email transaccional

- **Estado:** Aceptado
- **Fecha:** 2026-10-02

## Contexto

La captura de leads (spec 005) le avisa al dueño por email cada vez que llega un lead nuevo. Es el primer email que manda BrAInance. Requisitos:

- llegar a la bandeja de entrada, no a spam (dominio propio con SPF y DKIM);
- funcionar desde funciones serverless en Vercel, sin conexiones SMTP largas;
- costo cero o casi cero en la beta (decenas de emails por día);
- poder reemplazarlo sin tocar el dominio (`docs/principles.md`).

El código heredado declara `NODE_MAILER_EMAIL` y `NODE_MAILER_GMAIL_APP_PASSWORD` (Nodemailer con una cuenta de Gmail), pero ninguna parte del código actual lo usa.

## Opciones consideradas

1. **Nodemailer con Gmail (heredado).** Es gratis, pero Gmail limita los envíos diarios, requiere una contraseña de aplicación de una cuenta personal y manda desde `@gmail.com`, que se ve poco profesional y llega peor. SMTP desde serverless además es lento.
2. **Resend.** API HTTP simple y pensada para Next/Vercel. El plan gratuito incluye 3.000 emails por mes (100 por día), con verificación de dominio y métricas de entrega. Es un proveedor joven y el plan gratuito alcanza para la beta, no para el crecimiento.
3. **Amazon SES.** Es el más barato a escala (USD 0,10 cada 1.000), pero exige salir del sandbox con una solicitud manual, configurar IAM y manejar rebotes por SNS. Es demasiada operación para la beta.
4. **Postmark.** Tiene excelente entregabilidad para transaccionales, pero el plan gratuito es de 100 emails por mes, poco aun para la beta.

## Decisión

**Resend (opción 2), detrás de una interfaz.**

- `src/server/email/` expone `EmailSender.send({ to, subject, text, html, replyTo })`.
- Adaptadores:
  - `resend`: llama a la API HTTP con `fetch`, sin SDK;
  - `log`: escribe el email en la consola, para desarrollo y E2E.
- Variables: `EMAIL_PROVIDER` (`resend` | `log`, por defecto `log` fuera de producción), `RESEND_API_KEY` y `EMAIL_FROM` (por ejemplo, `BrAInance <avisos@brainance.app>`).
- En producción, si falta la clave, el envío falla de forma explícita en el log y la operación que lo pidió (guardar el lead) no se interrumpe.
- Se eliminan de `.env.example` las variables de Nodemailer.

## Consecuencias

- Antes del primer deploy con leads hay que verificar el dominio de envío en Resend (registros DNS SPF y DKIM). Hasta entonces Resend solo entrega a la cuenta dueña. Es una tarea manual.
- El límite de 100 emails por día del plan gratuito es compartido por todos los sitios. La spec 005 limita 50 emails por sitio y por día; con más de un par de sitios activos hay que pasar al plan pago (USD 20 por mes) o agregar resúmenes diarios.
- Cambiar a SES más adelante es escribir otro adaptador: el dominio y las acciones no cambian.
