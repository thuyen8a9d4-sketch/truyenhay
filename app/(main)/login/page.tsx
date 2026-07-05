import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập | VanThu",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold text-text">
        Đăng nhập
      </h1>
      <div className="rounded-xl border border-border bg-surface/50 p-6">
        <LoginForm />
      </div>
    </div>
  );
}
