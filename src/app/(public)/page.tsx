import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BetaTerms } from "@/components/landing/beta-terms";
import { Glows } from "@/components/landing/glows";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ProductShot } from "@/components/landing/product-shot";
import { Proofs } from "@/components/landing/proofs";
import { QuestionWall } from "@/components/landing/question-wall";
import Navbar from "@/components/navbar";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import published from "@/content/eval/rag-answers.json";
import { publishableEval } from "@/domain/eval-summary";

export const dynamic = "force-static";

const PROMISE = "BrAInance · Ningún cliente sin respuesta";
const SUMMARY =
  "El chat de tu sitio contesta con la información de tu negocio. Lo que no sabe no lo inventa: te avisa a vos, solo cuando hace falta.";

export const metadata: Metadata = {
  title: PROMISE,
  description: SUMMARY,
  openGraph: { title: PROMISE, description: SUMMARY, locale: "es_AR", type: "website" },
};

// Public landing. Design from spec 009 (warm paper, "Brasa" glows, the real panel in the hero);
// message from spec 013 (docs/posicionamiento.md): the promise, the problem in the owner's words,
// the three proofs, how it works, what happens after the beta.
export default function Home() {
  return (
    <div className="theme-paper min-h-screen flex flex-col overflow-x-clip bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <section className="relative isolate mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-16 md:px-8 lg:pt-24">
          <Glows layout="hero" />
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Beta gratuita · Hecho en Argentina</p>
            <h1 id="promesa" className="text-4xl font-bold leading-[1.05] tracking-tight [text-wrap:balance] sm:text-5xl md:text-6xl">
              Ningún cliente sin respuesta.
              <span className="block text-ember">Y vos te enterás solo cuando hace falta.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              BrAInance atiende el chat de tu sitio con la información de tu negocio. Lo que no sabe no lo inventa: te lo
              pasa a vos, con el motivo y la conversación.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">
                  Crear mi bot gratis <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">Sin tarjeta. Se instala con una línea.</span>
            </div>
          </div>
          <ProductShot />
          <p className="-mt-6 text-center text-xs text-muted-foreground">Panel de ejemplo, con datos ficticios.</p>
        </section>

        <QuestionWall />

        <Proofs evalSummary={publishableEval(published)} />

        <HowItWorks />

        <BetaTerms />

        <section className="relative isolate">
          <Glows layout="cta" />
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 md:flex-row md:items-end md:justify-between md:px-8">
            <h2 id="empezar" className="max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Probalo en tu sitio hoy. <span className="text-ember">Mañana ya responde.</span>
            </h2>
            <Button asChild size="lg">
              <Link href="/auth/sign-up">
                Crear mi bot gratis <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
