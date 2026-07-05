import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi | VanThu",
};

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-text">Hồ sơ của tôi</h1>
      <div className="rounded-xl border border-border bg-surface/50 p-6">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
