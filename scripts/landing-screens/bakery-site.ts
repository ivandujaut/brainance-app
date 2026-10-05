// The fictitious customer site for the landing's before/after (spec 009): a bakery in Rosario.
// Plain HTML and CSS with its own look, so the widget reads as something added to someone's site.

const PRODUCTS = [
  ["Pan de masa madre", "Fermentación de 24 horas. Sale a las 7."],
  ["Medialunas de manteca", "Por docena o media docena."],
  ["Tortas por encargo", "Con 48 horas de anticipación."],
];

const page = (extra: string) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8" /><title>La Espiga · Panadería artesanal</title>
<style>
  * { box-sizing: border-box; margin: 0; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #3b2a1e; background: #fbf6ef; }
  header { display: flex; align-items: center; justify-content: space-between; padding: 22px 64px; border-bottom: 1px solid #eadfce; }
  .logo { font-weight: 800; font-size: 22px; letter-spacing: -0.02em; }
  .logo span { color: #a0642a; }
  nav { display: flex; gap: 28px; font-size: 15px; color: #6b5442; }
  .hero { display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px; padding: 64px; align-items: center; }
  h1 { font-size: 52px; line-height: 1.05; letter-spacing: -0.03em; }
  .lead { margin-top: 18px; font-size: 18px; line-height: 1.6; color: #6b5442; max-width: 460px; }
  .hours { margin-top: 28px; display: inline-block; padding: 10px 16px; border-radius: 999px; background: #f1e4d2; font-size: 14px; }
  .loaf { height: 340px; border-radius: 28px; background:
    radial-gradient(ellipse 38% 26% at 50% 55%, #c68a4e 0 60%, transparent 61%),
    radial-gradient(ellipse 44% 32% at 50% 60%, #9c6232 0 60%, transparent 61%),
    linear-gradient(160deg, #f3e2c9, #e6cba5); }
  .products { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 0 64px 64px; }
  .card { padding: 22px; border-radius: 18px; background: #fff; border: 1px solid #eadfce; }
  .card h3 { font-size: 17px; } .card p { margin-top: 6px; font-size: 14px; color: #7a6352; }
  .contact { position: fixed; right: 20px; bottom: 88px; width: 380px; height: 600px; display: flex; flex-direction: column; padding: 24px; border-radius: 16px;
    background: #fff; border: 1px solid #eadfce; box-shadow: 0 8px 32px rgba(0,0,0,.12); }
  .contact h2 { font-size: 18px; } .contact p { margin-top: 6px; font-size: 14px; color: #7a6352; line-height: 1.5; }
  .field { margin-top: 14px; padding: 10px 12px; border-radius: 10px; border: 1px solid #e2d4c0; font-size: 14px; color: #7a6352; }
  .field.area { flex: 1; color: #3b2a1e; }
  .sent { margin-top: 16px; padding: 12px; border-radius: 10px; background: #fbf1e3; font-size: 13px; color: #8a5a22; }
</style></head>
<body>
  <header><div class="logo">La <span>Espiga</span></div>
    <nav><span>Productos</span><span>Encargos</span><span>Dónde estamos</span><span>Contacto</span></nav></header>
  <section class="hero"><div>
    <h1>Pan de masa madre, todos los días.</h1>
    <p class="lead">Panadería artesanal en Rosario desde 1987. Tortas por encargo, opciones sin TACC y envíos dentro de la ciudad.</p>
    <span class="hours">Lunes a sábado de 7 a 20 · Domingos de 8 a 13</span>
  </div><div class="loaf" aria-hidden="true"></div></section>
  <section class="products">${PRODUCTS.map(([t, d]) => `<div class="card"><h3>${t}</h3><p>${d}</p></div>`).join("")}</section>
  ${extra}
</body></html>`;

/** Before: the usual contact form, sent at 3:07 and waiting for business hours. */
export const bakeryBefore = () =>
  page(`<aside class="contact">
    <h2>Escribinos</h2>
    <p>Te respondemos de lunes a viernes de 9 a 18 h.</p>
    <div class="field">ana.romero@example.com</div>
    <div class="field area">Hola, ¿hacen tortas sin TACC? Es para el sábado.</div>
    <div class="sent">Mensaje enviado a las 3:07. Te vamos a responder en horario de atención.</div>
  </aside>`);

/** After: the same site with BrAInance's embed script; the real widget opens on top. */
export const bakeryAfter = (appOrigin: string, domainId: string) =>
  page(`<script src="${appOrigin}/widget.js" data-domain-id="${domainId}" async></script>`);

/** What the visitor and the bot said, served to the real widget in place of the API. */
export const CONVERSATION = [
  { id: "m1", role: "user", content: "Hola, ¿hacen tortas sin TACC? Es para el sábado." },
  {
    id: "m2",
    role: "assistant",
    content:
      "¡Hola! Sí: los jueves horneamos sin TACC en un horno aparte. Las tortas se encargan hasta el miércoles al mediodía. ¿Para cuántas personas sería?",
  },
  { id: "m3", role: "user", content: "Para 15, más o menos." },
  {
    id: "m4",
    role: "assistant",
    content:
      "Para 15 personas va bien la de 24 cm. El precio no lo tengo cargado: si me dejás tu email, Marta te lo confirma a primera hora y te reserva el sábado.",
  },
];
