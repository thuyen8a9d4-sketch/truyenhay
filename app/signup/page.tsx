import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Đăng ký | TruyệnHay",
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold text-text">
        Tạo tài khoản
      </h1>
      <div className="rounded-xl border border-border bg-surface/50 p-6">
        <SignupForm />
      </div>
    </div>
  );
}
