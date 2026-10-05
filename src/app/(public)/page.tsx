import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FeatureBento } from "@/components/landing/feature-bento";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ProductShot } from "@/components/landing/product-shot";
import Navbar from "@/components/navbar";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";

export const dynamic = "force-static";

const BUSINESSES = ["panaderías", "talleres", "inmobiliarias", "consultorios", "estudios contables", "tiendas de ropa", "gimnasios"];

// Public landing (spec 009): warm editorial look, the real inbox as the hero, Hairline figures.
export default function Home() {
  return (
    <div className="theme-paper min-h-screen flex flex-col overflow-x-clip bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto flex max-w-7xl flex-col gap-10 px-4 pt-16 md:px-8 lg:pt-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Beta gratuita · Hecho en Argentina</p>
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Tu negocio responde a las 3 de la mañana.
              <span className="block text-muted-foreground">Vos dormís.</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              BrAInance es un chat con IA para tu sitio. Contesta con la información de tu negocio, te pasa los contactos de
              los interesados y te avisa cuando hace falta una persona.
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
        </section>

        <section aria-label="Para quién es" className="border-t">
          <p className="mx-auto max-w-6xl px-4 py-6 text-lg font-medium text-muted-foreground md:px-8">
            Para {BUSINESSES.slice(0, -1).join(", ")} y {BUSINESSES.at(-1)}. Para cualquiera que conteste la misma pregunta
            veinte veces por día.
          </p>
        </section>

        <HowItWorks />

        <section aria-labelledby="que-hace" className="mx-auto max-w-6xl px-4 py-20 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Qué hace por vos</p>
          <h2 id="que-hace" className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Atiende como alguien de tu equipo, <span className="text-muted-foreground">no como un contestador.</span>
          </h2>
          <FeatureBento />
        </section>

        <section className="border-t">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 md:flex-row md:items-end md:justify-between md:px-8">
            <h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Probalo en tu sitio hoy. <span className="text-muted-foreground">Mañana ya responde.</span>
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
