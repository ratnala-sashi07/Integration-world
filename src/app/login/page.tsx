import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Log in · Integration World" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 grid place-items-center">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
