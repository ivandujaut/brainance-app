import { notFound } from "next/navigation";
import { onGetSiteSettings } from "@/actions/settings/bot";
import { BotSettings } from "@/components/bot-settings/bot-settings";

type Props = { params: Promise<{ siteId: string }> };

// Spec 004. A missing, malformed or foreign id all end in the same 404 (ADR 0004).
const SiteSettingsPage = async ({ params }: Props) => {
  const settings = await onGetSiteSettings((await params).siteId);
  if (!settings) notFound();
  return <BotSettings settings={settings} />;
};

export default SiteSettingsPage;
