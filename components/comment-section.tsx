import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { CommentForm } from "@/components/comment-form";
import type { CommentItem } from "@/lib/queries";

export function CommentSection({
  chapterId,
  revalidateTarget,
  comments,
  isLoggedIn,
}: {
  chapterId: string;
  revalidateTarget: string;
  comments: CommentItem[];
  isLoggedIn: boolean;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-bold text-text">
        Bình luận ({comments.length})
      </h2>

      <div className="mb-6">
        {isLoggedIn ? (
          <CommentForm chapterId={chapterId} revalidateTarget={revalidateTarget} />
        ) : (
          <p className="text-sm text-text-muted">
            <Link href="/login" className="text-accent hover:underline">
              Đăng nhập
            </Link>{" "}
            để bình luận.
          </p>
        )}
      </div>

      {comments.length === 0 ? (
        <p className="text-sm text-text-muted">Chưa có bình luận nào.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((c) => (
            <div key={c.id} className="border-b border-border pb-4 last:border-none">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-medium text-text">
                  {c.author?.display_name ?? c.author?.username ?? "Ẩn danh"}
                </span>
                <span className="text-xs text-text-muted">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm text-text-muted">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
