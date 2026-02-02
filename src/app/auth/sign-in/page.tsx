import { Suspense } from "react";
import { AuthFormCard } from "../_components/auth-form-card";
import { SignInWithGoogle } from "./_components/sign-in-with-google";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthFormCard
        classNames={{
          container: "items-center",
          card: "md:max-w-lg w-full bg-background",
          cardContent: "flex  flex-col-reverse md:flex-col-reverse",
          imageContainer: "h-[200px] block",
        }}
      >
        <SignInWithGoogle />
      </AuthFormCard>
    </Suspense>
  );
}
