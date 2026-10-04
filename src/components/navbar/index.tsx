import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../shared/mode-toggle";

const NavBar = () => (
  <header className="flex items-center justify-between gap-4 border-b px-4 py-3 md:px-8">
    <Link href="/" className="font-display text-2xl tracking-tight">
      Br
      <span className="relative">
        AI
        {/* The brand orange as an underline: as text it would not reach AA on the light surfaces. */}
        <span aria-hidden="true" className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full bg-primary" />
      </span>
      nance
    </Link>
    <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
      <ModeToggle />
      <Button asChild variant="ghost" className="hidden sm:inline-flex">
        <Link href="/auth/sign-in">Ingresar</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/sign-up">Probalo gratis</Link>
      </Button>
    </nav>
  </header>
);

export default NavBar;
