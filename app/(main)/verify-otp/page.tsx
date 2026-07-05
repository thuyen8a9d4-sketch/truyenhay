import type { Metadata } from "next";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

export const metadata: Metadata = {
  title: "Xác thực OTP | VanThu",
};

type SearchParams = Promise<{ email?: string }>;

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const email = sp.email ?? "";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-bold text-text">Xác thực tài khoản</h1>
      <p className="mb-6 text-center text-sm text-text-muted">
        Nhập mã OTP 6 số vừa được gửi tới{" "}
        {email ? <strong className="text-text">{email}</strong> : "email của bạn"}.
      </p>
      <div className="rounded-xl border border-border bg-surface/50 p-6">
        <VerifyOtpForm email={email} />
      </div>
    </div>
  );
}
