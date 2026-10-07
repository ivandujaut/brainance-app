import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WidgetChat } from "./chat";

// Spec 003 (QA of spec 011): until the chat is ready the input is disabled, so it has to look and
// say so; otherwise the visitor types and the text goes nowhere.
const config = {
  name: "panaderia.com.ar",
  welcomeMessage: "¡Hola!",
  icon: null,
  background: "#FFA947",
  textColor: "#0F172A",
};

describe("WidgetChat", () => {
  it("says the chat is loading while the input is not ready yet", () => {
    const html = renderToString(<WidgetChat domainId="d1" config={config} />);
    const textarea = html.match(/<textarea[^>]*>/)?.[0] ?? "";
    expect(textarea).toContain('placeholder="Cargando el chat…"');
    expect(textarea).toContain('disabled=""');
    expect(textarea).toContain("disabled:bg-gray-100");
  });

  it("keeps the preview's own placeholder", () => {
    const html = renderToString(<WidgetChat domainId="d1" config={config} preview />);
    expect(html).toContain('placeholder="Así lo ven tus visitantes"');
  });
});
