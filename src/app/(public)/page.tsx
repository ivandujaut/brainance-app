import { Bot, MessageSquareText, UserPlus } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    icon: Bot,
    title: "Contale a tu bot sobre tu negocio",
    text: "Cargá a qué te dedicás, tus preguntas frecuentes y a dónde derivar. Elegí los colores y el mensaje de bienvenida.",
  },
  {
    icon: MessageSquareText,
    title: "Pegá una línea en tu sitio",
    text: "El chat aparece abajo a la derecha y responde las consultas de tus visitantes con la información de tu negocio.",
  },
  {
    icon: UserPlus,
    title: "Recibí los contactos",
    text: "El bot les ofrece dejar su email y te avisa. Si hace falta, tomás la conversación y respondés vos.",
  },
];

// Public landing (spec 008), static: what BrAInance is and how to start. The beta only has a free plan.
export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 py-16 md:py-24 text-center flex flex-col items-center gap-6 max-w-3xl mx-auto">
          <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">Beta gratuita</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Un chat con IA que atiende tu sitio y te trae clientes</h1>
          <p className="text-lg text-muted-foreground">
            BrAInance responde las consultas de tus visitantes con la información de tu negocio, a cualquier hora, y te pasa los
            contactos de los interesados.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Crear mi bot gratis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/sign-in">Ya tengo cuenta</Link>
            </Button>
          </div>
        </section>

        <section aria-labelledby="como-funciona" className="px-4 pb-20 max-w-5xl mx-auto">
          <h2 id="como-funciona" className="text-2xl font-bold text-center mb-8">
            Cómo funciona
          </h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        {i + 1}
                      </span>
                      <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    </span>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
