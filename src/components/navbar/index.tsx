import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../shared/mode-toggle";

const NavBar = () => (
  <header className="flex items-center justify-between gap-4 border-b px-4 py-3 md:px-8">
    <Link href="/" className="text-2xl font-bold tracking-tight text-primary">
      BrAInance
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
