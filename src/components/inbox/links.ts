import type { InboxFilter } from "@/actions/conversation";

/** URL of the inbox with the given filters and open conversation. */
export const inboxHref = ({ siteId, filter, c }: { siteId?: string; filter?: InboxFilter; c?: string }) => {
  const params = new URLSearchParams();
  if (siteId) params.set("site", siteId);
  if (filter && filter !== "all") params.set("filter", filter);
  if (c) params.set("c", c);
  const query = params.toString();
  return query ? `/conversations?${query}` : "/conversations";
};

export const ATTENTION_REASONS: Record<string, string> = {
  derivation: "El bot derivó al contacto",
  human_request: "Pidió hablar con una persona",
  site_cap: "Se alcanzó el tope diario del bot",
};
