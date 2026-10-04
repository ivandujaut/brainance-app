import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { TERMS_VERSION } from "@/domain/legal";
import { CONVERSATION, CONVERSATIONS, SITES } from "./fixtures";

// The real dashboard layout and inbox page, rendered with fixture data (spec 009). Only the data
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
  onOwnerReply: vi.fn(),
  onTakeOver: vi.fn(),
  onReleaseToBot: vi.fn(),
}));
vi.mock("@/actions/leads", () => ({ onListLeadSites: async () => SITES }));
vi.mock("@/context/use-sidebar", () => ({
  default: () => ({ expand: true, onExpand: () => {}, page: "conversations", onSignOut: () => {} }),
}));
vi.mock("@/hooks/sidebar/use-domain", () => ({
  useDomain: () => ({ register: () => ({}), errors: {}, loading: false, onAddDomain: () => {}, isDomain: SITES[0].id }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/conversations",
  useRouter: () => ({ push: () => {}, refresh: () => {} }),
  notFound: () => {
    throw new Error("not found");
  },
  unstable_rethrow: () => {},
}));

const { default: OwnerLayout } = await import("@/app/(site)/(dashboard)/layout");
const { default: ConversationsPage } = await import("@/app/(site)/(dashboard)/conversations/page");

it("renders the inbox with fixture data", async () => {
  const page = await ConversationsPage({ searchParams: Promise.resolve({ c: "r1" }) });
  const html = renderToStaticMarkup(await OwnerLayout({ children: page }));
  expect(html).toContain("Marta");
  const out = path.join(process.cwd(), "scripts/landing-screens/out");
  mkdirSync(out, { recursive: true });
  writeFileSync(path.join(out, "inbox.body.html"), html);
});
