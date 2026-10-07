import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SiteSettings } from "@/actions/settings/bot";

// Spec 004, criteria 1, 2 and 4: the page renders the Spanish sections and the live preview, and
// any id that is not the owner's ends in a 404.
const onGetSiteSettings = vi.fn();
vi.mock("@/actions/settings/bot", () => ({ onGetSiteSettings: (id: string) => onGetSiteSettings(id) }));
vi.mock("@/actions/settings", () => ({}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  useRouter: () => ({ push: () => {}, refresh: () => {} }),
}));

const { default: SiteSettingsPage } = await import("./page");

const SITE_ID = "6f1c7f4e-1f3a-4c8e-9a3b-2d1e0f9c8b7a";
const settings: SiteSettings = {
  id: SITE_ID,
  name: "panaderia.com.ar",
  chatBot: {
    welcomeMessage: "¡Hola! Soy el bot de la panadería.",
    icon: null,
    background: "#FACC15",
    description: null,
    addressing: "vos",
    contact: null,
    installedAt: null,
    leadCapture: true,
    leadEmail: true,
    attentionEmail: true,
  },
  helpdesk: [{ id: "f1", question: "¿Abren los domingos?", answer: "Sí, de 8 a 13." }],
  filterQuestions: [],
};

const render = async (siteId = SITE_ID) => renderToString(await SiteSettingsPage({ params: Promise.resolve({ siteId }) }));

describe("site settings page", () => {
  beforeEach(() => {
    onGetSiteSettings.mockReset();
  });

  it("shows the sections in Spanish and the real widget as preview", async () => {
    onGetSiteSettings.mockResolvedValue(settings);
    const html = await render();
    for (const title of ["Negocio", "Apariencia", "Preguntas frecuentes", "Preguntas de calificación", "Captura de datos", "Instalación"]) {
      expect(html).toContain(title);
    }
    expect(html).toContain('data-testid="bot-preview"');
    expect(html).toContain("¡Hola! Soy el bot de la panadería.");
    expect(html).toContain("¿Abren los domingos?");
    // The preview uses the saved color with dark text on it.
    expect(html).toMatch(/background-color:#FACC15;color:#0F172A/);
  });

  it("drops the Premium badge and the static bot image", async () => {
    onGetSiteSettings.mockResolvedValue(settings);
    const html = await render();
    expect(html).not.toContain("Premium");
    expect(html).not.toContain("bot-ui.png");
  });

  it("asks for the missing business data", async () => {
    onGetSiteSettings.mockResolvedValue(settings);
    expect(await render()).toContain('data-testid="business-hint"');
    onGetSiteSettings.mockResolvedValue({
      ...settings,
      chatBot: { ...settings.chatBot!, description: "Panadería.", contact: "WhatsApp" },
    });
    expect(await render()).not.toContain('data-testid="business-hint"');
  });

  it("is not found when the site is not the owner's", async () => {
    onGetSiteSettings.mockResolvedValue(null);
    await expect(render("ajeno")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(onGetSiteSettings).toHaveBeenCalledWith("ajeno");
  });
});
