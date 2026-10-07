import { notFound } from "next/navigation";
import { onGetSiteSettings, onGetSiteUsage } from "@/actions/settings/bot";
import { BotSettings } from "@/components/bot-settings/bot-settings";

type Props = { params: Promise<{ siteId: string }> };

// Spec 004. A missing, malformed or foreign id all end in the same 404 (ADR 0004).
const SiteSettingsPage = async ({ params }: Props) => {
  const { siteId } = await params;
  const [settings, usage] = await Promise.all([onGetSiteSettings(siteId), onGetSiteUsage(siteId)]);
  if (!settings || !usage) notFound();
  return <BotSettings settings={settings} usage={usage} />;
};

export default SiteSettingsPage;
