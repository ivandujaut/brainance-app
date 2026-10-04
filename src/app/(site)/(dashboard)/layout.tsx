import { unstable_rethrow } from "next/navigation";
import React from "react";
import { onLoadAccount } from "@/actions/auth";
import { AccountError } from "@/components/account-error";
import { TermsBanner } from "@/components/legal/terms-banner";
import SideBar from "@/components/sidebar";
import { needsTermsAcceptance } from "@/domain/legal";
import { captureError } from "@/server/observability";

type Props = {
  children: React.ReactNode;
};

const OwnerLayout = async ({ children }: Props) => {
  let account: Awaited<ReturnType<typeof onLoadAccount>>;
  try {
    account = await onLoadAccount();
  } catch (error) {
    unstable_rethrow(error);
    captureError(error, { area: "settings", extra: { step: "load account" } });
    return <AccountError />;
  }

  return (
    <div className="flex h-screen w-full">
      <SideBar domains={account.domains} />
      <div className="w-full h-screen flex flex-col py-3 pr-10 pl-20 md:px-10">
        {needsTermsAcceptance(account.user) && <TermsBanner />}
        {children}
      </div>
    </div>
  );
};

export default OwnerLayout;
