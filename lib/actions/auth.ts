"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/site-url";

export type AuthState = { error?: string } | undefined;

export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Vui lòng nhập đầy đủ email và mật khẩu." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email hoặc mật khẩu không đúng." };
  }

  redirect("/");
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password) {
    return { error: "Vui lòng nhập đầy đủ email và mật khẩu." };
  }
  if (password.length < 6) {
    return { error: "Mật khẩu phải có ít nhất 6 ký tự." };
  }
  if (password !== confirmPassword) {
    return { error: "Mật khẩu xác nhận không khớp." };
  }

  const origin = await getOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    redirect("/");
  }

  redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
}

export type OtpState = { error?: string } | undefined;

export async function verifySignupOtp(
  _prevState: OtpState,
  formData: FormData,
): Promise<OtpState> {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();

  if (!email || !token) {
    return { error: "Vui lòng nhập đầy đủ mã OTP." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    return { error: "Mã OTP không đúng hoặc đã hết hạn." };
  }

  redirect("/");
}

export async function resendSignupOtp(
  email: string,
): Promise<{ error?: string; sent?: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (error) {
    return { error: "Không thể gửi lại mã. Vui lòng thử lại sau." };
  }

  return { sent: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
