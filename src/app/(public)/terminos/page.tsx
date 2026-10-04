import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/legal-document";

export const dynamic = "force-static";
export const metadata: Metadata = { title: "Términos de uso · BrAInance" };

export default function TermsPage() {
  return <LegalDocument file="terminos" />;
}
