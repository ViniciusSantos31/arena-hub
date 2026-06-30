import { redirect } from "next/navigation";
import { AuthFormCard } from "../_components/auth-form-card";
import { SignUpForm } from "./_components/sign-up-form";

export default function SignUpPage() {
  return redirect("/auth/sign-in");

  return (
    <AuthFormCard classNames={{ container: "items-center", card: "w-full" }}>
      <SignUpForm />
    </AuthFormCard>
  );
}
