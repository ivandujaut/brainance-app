import { onListLeadSites } from "@/actions/leads";
import { onGetOwnerMetrics, type MetricsPeriod } from "@/actions/metrics";
import { onGetOnboarding } from "@/actions/onboarding";
import { onGetSiteUsage } from "@/actions/settings/bot";
import InfoBar from "@/components/infobar";
import { OwnerMetrics } from "@/components/metrics/owner-metrics";
import { OnboardingChecklist } from "@/components/onboarding/checklist";

type Props = { searchParams: Promise<{ days?: string; site?: string }> };

const DashboardPage = async ({ searchParams }: Props) => {
  const onboarding = await onGetOnboarding();
  const pending = onboarding && !onboarding.completed;
  // Until the bot has a conversation, the checklist is all there is to show.
  if (pending && !onboarding.hasConversations) {
    return (
      <>
        <InfoBar />
        <div className="flex flex-col gap-6 max-w-3xl">
          <OnboardingChecklist steps={onboarding.steps} site={onboarding.site} />
        </div>
      </>
    );
  }

  // Spec 007: once the bot is set up, the dashboard shows what it brought in.
  const params = await searchParams;
  const days: MetricsPeriod = params.days === "30" ? 30 : 7;
  const sites = await onListLeadSites();
  const siteId = sites.find((s) => s.id === params.site)?.id;
  // Spec 011, criterion 11: with a site chosen, today's usage against its cap.
  const [metrics, usage] = await Promise.all([onGetOwnerMetrics({ days, siteId }), siteId ? onGetSiteUsage(siteId) : null]);

  return (
    <>
      <InfoBar />
      <div className="flex-1 h-0 overflow-y-auto flex flex-col gap-6 max-w-5xl pb-10" data-testid="dashboard-ready">
        {/* QA of spec 011: a bot that already answers shows its metrics, with the checklist on top. */}
        {pending && (
          <div className="max-w-3xl">
            <OnboardingChecklist steps={onboarding.steps} site={onboarding.site} />
          </div>
        )}
        <header>
          <h2 className="text-2xl font-bold">{pending ? "Tu bot ya está respondiendo" : "Tu bot está funcionando"}</h2>
          <p className="text-sm text-muted-foreground">Lo que trajo tu bot en el período elegido.</p>
        </header>
        {metrics && <OwnerMetrics metrics={metrics} sites={sites} siteId={siteId} days={days} usage={usage} />}
      </div>
    </>
  );
};

export default DashboardPage;
