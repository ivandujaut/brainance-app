import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

// Spec 009, after Aceternity's "footer with big text": the links grouped by topic and, closing the
// page, the brand name huge and fading out in the ember gradient. Shared by the landing and the
// legal pages, so section links point to the landing ("/#…").
const GROUPS = [
  {
    title: "Producto",
    links: [
      { href: "/#como-funciona", label: "Cómo funciona" },
      { href: "/#que-hace", label: "Qué hace por vos" },
      { href: "/auth/sign-up", label: "Probalo gratis" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { href: "/auth/sign-in", label: "Ingresar" },
      { href: "/auth/sign-up", label: "Crear cuenta" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terminos", label: "Términos" },
      { href: "/privacidad", label: "Privacidad" },
    ],
  },
];

export const SiteFooter = () => (
  <footer className="overflow-hidden pt-16">
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:flex-row md:justify-between md:px-8">
      <div className="flex max-w-xs flex-col gap-3">
        <Link href="/" aria-label="BrAInance, inicio" className="w-fit">
          <Wordmark className="text-2xl" />
        </Link>
        <p className="text-sm leading-relaxed text-muted-foreground">
          El chat con IA que responde a tus clientes a cualquier hora y te pasa los contactos.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
        {GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title} className="flex flex-col gap-3 text-sm">
            <p className="font-semibold">{group.title}</p>
            {group.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="w-fit text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
    </div>

    <p className="mx-auto mt-14 max-w-6xl px-4 text-xs text-muted-foreground md:px-8">
      © {new Date().getFullYear()} BrAInance · Hecho en Argentina
    </p>

    {/* Decorative: the name already appears above as a link. */}
    <p
      aria-hidden="true"
      className="pointer-events-none mx-auto -mb-[0.22em] mt-4 select-none text-center text-[19vw] font-bold leading-none tracking-tighter text-transparent [background-image:linear-gradient(to_bottom,hsl(var(--ember-from)/0.55),hsl(var(--ember-to)/0.05)_85%)] [background-clip:text] [-webkit-background-clip:text] xl:text-[17rem]"
    >
      BrAInance
    </p>
  </footer>
);
