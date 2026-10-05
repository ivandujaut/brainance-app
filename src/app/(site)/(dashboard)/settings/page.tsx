import InfoBar from "@/components/infobar";
import ChangePassword from "@/components/settings/change-password";

// The owner's account (spec 008): no billing nor theme picker in the beta.
const AccountPage = () => (
  <>
    <InfoBar />
    <div className="overflow-y-auto w-full flex-1 h-0 flex flex-col gap-6 max-w-3xl pb-10">
      <ChangePassword />
    </div>
  </>
);

export default AccountPage;
