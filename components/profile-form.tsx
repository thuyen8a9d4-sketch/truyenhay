"use client";

import { useActionState, useState } from "react";
import { updateProfile, type ProfileState } from "@/lib/actions/profile";
import type { Profile } from "@/lib/database.types";

const initialState: ProfileState = undefined;

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateProfile, initialState);
  const [isAuthor, setIsAuthor] = useState(profile.is_author);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-text-muted">Tên đăng nhập</label>
        <input
          disabled
          value={profile.username}
          className="rounded-lg border border-border bg-surface/50 px-3.5 py-2.5 text-text-muted"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="displayName" className="text-sm text-text-muted">
          Tên hiển thị
        </label>
        <input
          id="displayName"
          name="displayName"
          defaultValue={profile.display_name ?? ""}
          className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
          placeholder="Tên hiển thị của bạn"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-sm text-text-muted">
          Giới thiệu bản thân
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ""}
          rows={4}
          className="resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-text outline-none focus:border-accent"
          placeholder="Đôi nét về bạn..."
        />
      </div>

      <label className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-3">
        <input
          type="checkbox"
          name="isAuthor"
          checked={isAuthor}
          onChange={(e) => setIsAuthor(e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        <span className="text-sm text-text">
          Tôi muốn trở thành <strong>tác giả</strong> để đăng truyện của mình
        </span>
      </label>

      {state?.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-green-600 dark:text-green-400">Đã lưu thay đổi.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
