import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Spec 006, criteria 1–3: the inbox lists conversations and shows the open one.
const actions = vi.hoisted(() => ({
  onListConversations: vi.fn(),
  onGetConversation: vi.fn(),
  onGetInboxRealtime: vi.fn(),
}));
vi.mock("@/actions/conversation", () => ({ ...actions, onMarkRead: vi.fn(), onOwnerReply: vi.fn(), onTakeOver: vi.fn(), onReleaseToBot: vi.fn() }));
vi.mock("@/actions/leads", () => ({ onListLeadSites: async () => [{ id: "s1", name: "panaderia.com.ar" }] }));

const { default: ConversationsPage } = await import("./page");
const render = async (params: Record<string, string> = {}) =>
  renderToString(await ConversationsPage({ searchParams: Promise.resolve(params) }));

const summary = {
  id: "r1",
  site: "panaderia.com.ar",
  visitor: "ana@example.com",
  lastMessage: "No tengo ese dato.",
  lastMessageAt: new Date("2026-10-04T12:00:00Z"),
  unread: 2,
  live: false,
  needsAttention: true,
  attentionReason: "derivation",
};

describe("conversations page", () => {
  beforeEach(() => {
    actions.onListConversations.mockReset().mockResolvedValue([summary]);
    actions.onGetConversation.mockReset().mockResolvedValue({
      id: "r1",
      site: "panaderia.com.ar",
      live: true,
      needsAttention: false,
      attentionReason: null,
      lead: { email: "ana@example.com", responses: [{ question: "¿Qué buscás?", answered: "Tortas" }] },
      messages: [
        { id: "m1", role: "user", content: "¿Tienen sin TACC?", createdAt: new Date() },
        { id: "m2", role: "system", content: "Ahora te atiende una persona de panaderia.com.ar.", createdAt: new Date() },
        { id: "m3", role: "owner", content: "Sí, los jueves.", createdAt: new Date() },
      ],
    });
    actions.onGetInboxRealtime.mockReset().mockResolvedValue(null);
  });

  it("lists conversations with unread count and the attention flag", async () => {
    const html = await render();
    expect(html).toContain("ana@example.com");
    expect(html).toContain("No tengo ese dato.");
    expect(html).toContain("Necesita atención");
    expect(html).toContain('data-testid="inbox-unread"');
    expect(actions.onGetConversation).not.toHaveBeenCalled();
  });

  it("shows the open conversation with roles, notices, lead data and the takeover state", async () => {
    const html = await render({ c: "r1" });
    expect(actions.onGetConversation).toHaveBeenCalledWith("r1");
    expect(html).toContain("Sí, los jueves.");
    expect(html).toContain("Ahora te atiende una persona de panaderia.com.ar.");
    expect(html).toContain("Tortas");
    expect(html).toContain("Estás atendiendo");
    expect(html).toContain("Devolver al bot");
  });

  it("passes known filters and ignores unknown ones", async () => {
    await render({ filter: "attention", site: "s1" });
    expect(actions.onListConversations).toHaveBeenLastCalledWith({ siteId: "s1", filter: "attention" });
    await render({ filter: "cualquiera", site: "ajeno" });
    expect(actions.onListConversations).toHaveBeenLastCalledWith({ siteId: undefined, filter: "all" });
  });
});
