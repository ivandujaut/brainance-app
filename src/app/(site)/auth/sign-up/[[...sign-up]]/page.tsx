import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-10 w-full">
      <SignUp routing="path" path="/auth/sign-up" signInUrl="/auth/sign-in" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
