import { SignInForm } from "@/app/auth/sign-in/_components/sign-in-form";
import { AuthFormCard } from "../_components/auth-form-card";

export default function LoginPage() {
  return (
    <AuthFormCard>
      <SignInForm />
    </AuthFormCard>
  );
}
