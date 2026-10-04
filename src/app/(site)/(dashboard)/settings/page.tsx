import InfoBar from "@/components/infobar";
import ChangePassword from "@/components/settings/change-password";
import DarkModeToggle from "@/components/settings/dark-mode";

// The owner's account (spec 008): no billing in the beta.
const AccountPage = () => (
  <>
    <InfoBar />
    <div className="overflow-y-auto w-full flex-1 h-0 flex flex-col gap-6 max-w-3xl pb-10">
      <DarkModeToggle />
      <ChangePassword />
    </div>
  </>
);

export default AccountPage;
