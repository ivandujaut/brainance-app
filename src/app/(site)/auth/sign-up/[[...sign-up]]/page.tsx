import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10 w-full">
      <SignUp routing="path" path="/auth/sign-up" signInUrl="/auth/sign-in" fallbackRedirectUrl="/dashboard" />
      {/* Spec 008: creating the account records the acceptance (src/server/users.ts). */}
      <p className="max-w-sm text-center text-sm text-muted-foreground" data-testid="terms-notice">
        Al registrarte aceptás los{" "}
        <Link href="/terminos" target="_blank" className="underline underline-offset-2">
          Términos
        </Link>{" "}
        y la{" "}
        <Link href="/privacidad" target="_blank" className="underline underline-offset-2">
          Política de privacidad
        </Link>
        .
      </p>
    </div>
  );
}
