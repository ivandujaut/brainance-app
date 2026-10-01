import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-10 w-full">
      <SignIn routing="path" path="/auth/sign-in" signUpUrl="/auth/sign-up" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
