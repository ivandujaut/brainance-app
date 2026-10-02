import { onGetOnboarding } from "@/actions/onboarding";
import InfoBar from "@/components/infobar";
import { OnboardingChecklist } from "@/components/onboarding/checklist";

const DashboardPage = async () => {
  const onboarding = await onGetOnboarding();

  return (
    <>
      <InfoBar />
      <div className="flex flex-col gap-6 max-w-3xl">
        {onboarding && !onboarding.completed ? (
          <OnboardingChecklist steps={onboarding.steps} site={onboarding.site} />
        ) : (
          <div data-testid="dashboard-ready">
            <h2 className="text-2xl font-bold">Tu bot está listo</h2>
            <p className="text-gray-500">Muy pronto vas a ver acá las conversaciones y los contactos que capte.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardPage;
