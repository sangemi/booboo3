"use client";

import { ExternalLink, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { categoryLabels } from "@/lib/community-data";

type PostRow = {
  id: string;
  publicId: number;
  title: string;
  category: keyof typeof categoryLabels;
  authorName: string;
  isAnonymous: boolean;
  createdAt: string;
  _count: { comments: number; reactions: number };
};

export function AdminPostTable({ posts }: { posts: PostRow[] }) {
  const [rows, setRows] = useState(posts);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const allSelected = rows.length > 0 && rows.every((post) => selected.has(post.id));

  function togglePost(postId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((post) => post.id)));
  }

  function deleteOne(postId: string) {
    setSelected(new Set([postId]));
    setError("");
    setConfirmOpen(true);
  }

  async function deleteSelected() {
    if (selected.size === 0 || deleting) return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds: Array.from(selected) }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "게시글을 삭제하지 못했습니다.");
        return;
      }

      setRows((current) => current.filter((post) => !selected.has(post.id)));
      setMessage(`${data.deletedCount.toLocaleString()}개의 게시글을 삭제했습니다.`);
      setSelected(new Set());
      setConfirmOpen(false);
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="mt-5 flex min-h-10 items-center justify-between gap-3">
        <p className="text-xs font-semibold text-[#746e6a]">{selected.size > 0 ? `${selected.size}개 선택` : "삭제할 글을 선택할 수 있습니다."}</p>
        <button type="button" disabled={selected.size === 0} onClick={() => { setError(""); setConfirmOpen(true); }} className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-[#d8b8b2] bg-white px-3 text-sm font-bold text-[#9b3f36] disabled:opacity-40">
          <Trash2 className="size-4" /> 선택 삭제
        </button>
      </div>

      {message ? <p className="mt-3 rounded-[6px] border border-[#cfe1d4] bg-[#edf6ef] px-3 py-2 text-sm text-[#356447]">{message}</p> : null}

      <div className="mt-3 overflow-x-auto rounded-[6px] border border-[#d8d2cc] bg-white">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-[#ddd7d1] bg-[#f3f0ed] text-xs text-[#746e6a]">
            <tr>
              <th className="w-12 px-4 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="현재 목록 전체 선택" className="size-4 accent-[#6f3d5b]" /></th>
              <th className="px-3 py-3 font-bold">게시글</th>
              <th className="px-3 py-3 font-bold">작성자</th>
              <th className="px-3 py-3 font-bold">활동</th>
              <th className="px-3 py-3 font-bold">작성일</th>
              <th className="w-20 px-4 py-3 text-right font-bold">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebe7e3]">
            {rows.map((post) => (
              <tr key={post.id} className={selected.has(post.id) ? "bg-[#fbf3f1]" : "hover:bg-[#fbfaf8]"}>
                <td className="px-4 py-3"><input type="checkbox" checked={selected.has(post.id)} onChange={() => togglePost(post.id)} aria-label={`${post.title} 선택`} className="size-4 accent-[#6f3d5b]" /></td>
                <td className="max-w-lg px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 rounded bg-[#efe5eb] px-1.5 py-0.5 text-[10px] font-bold text-[#6f3d5b]">{categoryLabels[post.category]}</span>
                    <Link href={`/talk/post/${post.publicId}`} className="truncate font-semibold hover:text-[#6f3d5b] hover:underline">{post.title}</Link>
                  </div>
                  <p className="mt-1 text-[11px] text-[#918a85]">글 번호 {post.publicId}</p>
                </td>
                <td className="px-3 py-3 text-xs text-[#655f5c]">{post.isAnonymous ? "익명" : post.authorName}</td>
                <td className="px-3 py-3 text-xs text-[#655f5c]">댓글 {post._count.comments} · 반응 {post._count.reactions}</td>
                <td className="px-3 py-3 text-xs text-[#817a75]">{formatDate(post.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Link href={`/talk/post/${post.publicId}`} aria-label="게시글 열기" title="게시글 열기" className="grid size-8 place-items-center rounded-[6px] text-[#746e6a] hover:bg-[#f1eeeb]"><ExternalLink className="size-4" /></Link>
                    <button type="button" onClick={() => deleteOne(post.id)} aria-label="게시글 삭제" title="삭제" className="grid size-8 place-items-center rounded-[6px] text-[#a33c32] hover:bg-[#fff0ed]"><Trash2 className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-16 text-center text-sm text-[#918a85]">관리할 게시글이 없습니다.</td></tr> : null}
          </tbody>
        </table>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-[70] grid place-items-center px-4">
          <button type="button" className="absolute inset-0 bg-black/45" onClick={() => setConfirmOpen(false)} aria-label="삭제 확인 창 닫기" />
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-posts-title" className="relative w-full max-w-md rounded-[8px] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#e4dfda] px-5 py-4">
              <div><h2 id="delete-posts-title" className="text-lg font-bold">게시글 삭제</h2><p className="mt-1 text-sm text-[#746e6a]">선택한 {selected.size}개의 글을 삭제합니다.</p></div>
              <button type="button" onClick={() => setConfirmOpen(false)} className="grid size-8 place-items-center rounded-[6px] text-[#746e6a] hover:bg-[#f1eeeb]" aria-label="닫기"><X className="size-4" /></button>
            </div>
            <div className="px-5 py-5"><p className="text-sm leading-6 text-[#5f5956]">댓글, 반응, 판정 투표도 함께 삭제되며 되돌릴 수 없습니다.</p>{error ? <p role="alert" className="mt-3 rounded-[6px] bg-[#fff0ed] px-3 py-2 text-sm text-[#a33c32]">{error}</p> : null}</div>
            <div className="flex justify-end gap-2 border-t border-[#e4dfda] bg-[#f7f5f2] px-5 py-4"><button type="button" onClick={() => setConfirmOpen(false)} className="h-9 rounded-[6px] border border-[#d8d2cc] bg-white px-4 text-sm font-bold">취소</button><button type="button" onClick={deleteSelected} disabled={deleting} className="h-9 rounded-[6px] bg-[#a33c32] px-4 text-sm font-bold text-white disabled:opacity-50">{deleting ? "삭제 중" : "게시글 삭제"}</button></div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "2-digit", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" }).format(new Date(value));
}
