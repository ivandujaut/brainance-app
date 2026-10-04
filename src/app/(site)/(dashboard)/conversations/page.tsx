import { onGetConversation, onGetInboxRealtime, onListConversations, type InboxFilter } from "@/actions/conversation";
import { onListLeadSites } from "@/actions/leads";
import { Inbox } from "@/components/inbox/inbox";

type Props = { searchParams: Promise<{ site?: string; filter?: string; c?: string }> };

const FILTERS: InboxFilter[] = ["all", "unread", "attention"];

// Spec 006: the owner's inbox. The open conversation lives in the URL (?c=<id>) so it can be shared
// and the back button works on phones.
const ConversationsPage = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const sites = await onListLeadSites();
  const siteId = sites.find((s) => s.id === params.site)?.id;
  const filter = FILTERS.find((f) => f === params.filter) ?? "all";
  const [conversations, selected, realtime] = await Promise.all([
    onListConversations({ siteId, filter }),
    params.c ? onGetConversation(params.c) : null,
    onGetInboxRealtime(),
  ]);

  return (
    <Inbox
      key={`${siteId ?? ""}:${filter}:${selected?.id ?? ""}`}
      sites={sites}
      siteId={siteId}
      filter={filter}
      initialConversations={conversations}
      initialSelected={selected}
      realtime={realtime}
    />
  );
};

export default ConversationsPage;
