import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const dynamic = "force-static";
export const metadata: Metadata = { title: "Política de privacidad · BrAInance" };

export default function PrivacyPage() {
  return <LegalDocument file="privacidad" />;
}
