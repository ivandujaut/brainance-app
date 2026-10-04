import { notFound } from "next/navigation";
import { z } from "zod";
import { WidgetChat } from "@/components/widget/chat";
import { client } from "@/lib/prisma";
import { publicRealtimeConfig } from "@/server/realtime";
import { getWidgetSite, toPublicConfig } from "@/server/widget-site";

export default async function WidgetPage({ params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = await params;
  const site = z.string().uuid().safeParse(domainId).success ? await getWidgetSite(client, domainId) : null;
  if (!site) notFound();

  return <WidgetChat domainId={site.id} config={{ ...toPublicConfig(site), realtime: publicRealtimeConfig() }} />;
}
