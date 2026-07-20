import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Sign up · Integration World" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 grid place-items-center">
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
