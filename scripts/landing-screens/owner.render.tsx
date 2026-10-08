import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { TERMS_VERSION } from "@/domain/legal";
import { CONVERSATION, CONVERSATIONS, METRICS, SITES } from "./fixtures";

// The real dashboard layout with the inbox and the metrics pages, rendered with fixture data (spec 009). Only the data
// sources and the router are mocked; every component is the one owners see.
vi.mock("@/actions/auth", () => ({
  onLoadAccount: async () => ({
    user: { id: "u1", termsVersion: TERMS_VERSION },
    domains: SITES.map((s) => ({ ...s, icon: "" })),
  }),
  onAcceptTerms: vi.fn(),
}));
vi.mock("@/actions/conversation", () => ({
  onListConversations: async () => CONVERSATIONS,
  onGetConversation: async () => CONVERSATION,
  onGetInboxRealtime: async () => null,
  onMarkRead: vi.fn(),
  onMarkAttended: vi.fn(),
  onOwnerReply: vi.fn(),
  onTakeOver: vi.fn(),
  onReleaseToBot: vi.fn(),
}));
vi.mock("@/actions/leads", () => ({ onListLeadSites: async () => SITES }));
vi.mock("@/actions/metrics", () => ({ onGetOwnerMetrics: async () => METRICS }));
vi.mock("@/actions/onboarding", () => ({ onGetOnboarding: async () => ({ completed: true }) }));
vi.mock("@/actions/settings/bot", () => ({ onGetSiteUsage: async () => null }));
// The sidebar and the page title read the current section from here.
const current = vi.hoisted(() => ({ page: "conversations" }));
vi.mock("@/context/use-sidebar", () => ({
  default: () => ({ expand: true, onExpand: () => {}, page: current.page, onSignOut: () => {} }),
}));
vi.mock("@/hooks/sidebar/use-domain", () => ({
  useDomain: () => ({ register: () => ({}), errors: {}, loading: false, onAddDomain: () => {}, isDomain: SITES[0].id }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => `/${current.page}`,
  useRouter: () => ({ push: () => {}, refresh: () => {} }),
  notFound: () => {
    throw new Error("not found");
  },
  unstable_rethrow: () => {},
}));

const { default: OwnerLayout } = await import("@/app/(site)/(dashboard)/layout");
const { default: ConversationsPage } = await import("@/app/(site)/(dashboard)/conversations/page");
const { default: DashboardPage } = await import("@/app/(site)/(dashboard)/dashboard/page");

const out = path.join(process.cwd(), "scripts/landing-screens/out");
const save = (name: string, html: string) => {
  mkdirSync(out, { recursive: true });
  writeFileSync(path.join(out, `${name}.body.html`), html);
};

it("renders the inbox with fixture data", async () => {
  current.page = "conversations";
  const page = await ConversationsPage({ searchParams: Promise.resolve({ c: "r1" }) });
  const html = renderToStaticMarkup(await OwnerLayout({ children: page }));
  expect(html).toContain("Marta");
  save("inbox", html);
});

it("renders the metrics dashboard with fixture data", async () => {
  current.page = "dashboard";
  const page = await DashboardPage({ searchParams: Promise.resolve({ days: "30" }) });
  const html = renderToStaticMarkup(await OwnerLayout({ children: page }));
  expect(html).toContain("Tasa de captura");
  expect(html).toContain("Respuestas del bot");
  save("dashboard", html);
});
