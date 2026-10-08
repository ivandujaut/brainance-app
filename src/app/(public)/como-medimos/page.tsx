import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { HowWeMeasure } from "@/components/landing/how-we-measure";
import Navbar from "@/components/navbar";
import { SiteFooter } from "@/components/site/footer";
import published from "@/content/eval/rag-answers.json";
import { describeEvalSet, publishableEval } from "@/domain/eval-summary";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Cómo lo medimos · BrAInance",
  description: "Cómo probamos que el bot no le inventa respuestas a tus clientes, qué encontramos y qué no prueba.",
};

// Spec 013, criteria 11 and 12: public and static, like the legal pages. Read at build time.
export default function HowWeMeasurePage() {
  const cases = JSON.parse(readFileSync(path.join(process.cwd(), "evals/rag-answers/cases.json"), "utf8"));
  return (
    <div className="theme-paper min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <HowWeMeasure set={describeEvalSet(cases)} summary={publishableEval(published)} />
      </main>
      <SiteFooter />
    </div>
  );
}
