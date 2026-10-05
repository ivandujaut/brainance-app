import Link from "next/link";

export const SiteFooter = () => (
  <footer className="px-4 py-6 md:px-8 text-sm text-muted-foreground flex flex-wrap items-center justify-between gap-3">
    <p>© {new Date().getFullYear()} BrAInance</p>
    <nav aria-label="Legal" className="flex gap-4">
      <Link href="/terminos" className="hover:text-foreground underline-offset-2 hover:underline">
        Términos
      </Link>
      <Link href="/privacidad" className="hover:text-foreground underline-offset-2 hover:underline">
        Privacidad
      </Link>
    </nav>
  </footer>
);
