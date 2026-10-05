import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";

const NavBar = () => (
  <header className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
    <Link href="/" aria-label="BrAInance, inicio">
      <Wordmark className="text-2xl" />
    </Link>
    <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
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
