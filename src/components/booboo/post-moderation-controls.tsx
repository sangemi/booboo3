"use client";

import { ShieldAlert, Trash2, UserX, X } from "lucide-react";
import { useState } from "react";

type Action = "delete" | "delete_and_suspend";

export function PostModerationControls({
  postId,
  postTitle,
  canSuspend,
  onModerated,
}: {
  postId: string;
  postTitle: string;
  canSuspend: boolean;
  onModerated: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [action, setAction] = useState<Action | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!action || pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/posts/${postId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "처리하지 못했습니다. 다시 시도해 주세요.");
        return;
      }
      setAction(null);
      onModerated();
    } catch {
      setError("연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 flex justify-end">
      <div className="relative">
        <button
          type="button"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-8 items-center gap-1 rounded-[6px] border border-[#ded4cc] bg-white px-2.5 text-xs font-bold text-[#705264] hover:bg-[#f7f0f4]"
        >
          <ShieldAlert className="size-3.5" aria-hidden="true" /> 관리자
        </button>
        {menuOpen ? (
          <div className="absolute right-0 top-9 z-20 w-44 rounded-[6px] border border-[#ded4cc] bg-white p-1 shadow-lg">
            <button type="button" onClick={() => { setAction("delete"); setMenuOpen(false); setError(""); }} className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-2 text-left text-xs hover:bg-[#f7f0f4]">
              <Trash2 className="size-3.5" aria-hidden="true" /> 글 삭제
            </button>
            {canSuspend ? (
              <button type="button" onClick={() => { setAction("delete_and_suspend"); setMenuOpen(false); setError(""); }} className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-2 text-left text-xs text-[#a33c32] hover:bg-[#fff0ed]">
                <UserX className="size-3.5" aria-hidden="true" /> 글 삭제 + 회원 정지
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {action ? (
        <div className="fixed inset-0 z-[80] grid place-items-center px-4">
          <button type="button" className="absolute inset-0 bg-black/45" onClick={() => !pending && setAction(null)} aria-label="관리 창 닫기" />
          <section role="dialog" aria-modal="true" aria-labelledby="post-moderation-title" className="relative w-full max-w-sm rounded-[8px] bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <h2 id="post-moderation-title" className="text-base font-bold">{action === "delete" ? "글을 삭제할까요?" : "글을 삭제하고 회원을 정지할까요?"}</h2>
              <button type="button" aria-label="닫기" onClick={() => setAction(null)} disabled={pending} className="text-[#756c66]"><X className="size-4" /></button>
            </div>
            <p className="mt-2 break-words text-sm text-[#665e59]">{postTitle}</p>
            <p className="mt-2 text-xs leading-5 text-[#817a75]">{action === "delete" ? "삭제 후 글과 댓글은 공개되지 않습니다. 원문은 관리자 이력에 남습니다." : "연결된 계정을 보존하고 로그인만 차단합니다. 원문은 관리자 이력에 남습니다."}</p>
            {error ? <p role="alert" className="mt-3 text-xs text-[#a33c32]">{error}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setAction(null)} disabled={pending} className="h-9 rounded-[6px] border border-[#ded4cc] px-3 text-sm">취소</button>
              <button type="button" onClick={submit} disabled={pending} className="h-9 rounded-[6px] bg-[#a33c32] px-3 text-sm font-bold text-white disabled:opacity-50">{pending ? "처리 중" : action === "delete" ? "삭제" : "삭제하고 정지"}</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
