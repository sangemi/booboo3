"use client";

import { Banknote, Gift, MoreHorizontal, X } from "lucide-react";
import { useState } from "react";

type UserRow = {
  id: string;
  email: string | null;
  nickname: string | null;
  name: string | null;
  role: string;
  provider: string;
  cashBalance: number;
  pointBalance: number;
  createdAt: string;
  _count: { posts: number; comments: number; personas: number };
};

type GrantState = {
  user: UserRow;
  asset: "CASH" | "POINT";
};

export function AdminUserTable({ users }: { users: UserRow[] }) {
  const [rows, setRows] = useState(users);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [grant, setGrant] = useState<GrantState | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function openGrant(user: UserRow, asset: "CASH" | "POINT") {
    setOpenMenuId(null);
    setGrant({ user, asset });
    setAmount("");
    setReason("");
    setError("");
  }

  async function submitGrant() {
    if (!grant || saving) return;
    const parsedAmount = Number(amount);

    if (!Number.isInteger(parsedAmount) || parsedAmount < 1) {
      setError("지급 수량을 1 이상 입력해 주세요.");
      return;
    }
    if (reason.trim().length < 2) {
      setError("지급 사유를 입력해 주세요.");
      return;
    }

    setSaving(true);
    setError("");
    const response = await fetch(`/api/admin/users/${grant.user.id}/wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        asset: grant.asset,
        amount: parsedAmount,
        reason: reason.trim(),
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "재화를 지급하지 못했습니다.");
      setSaving(false);
      return;
    }

    setRows((current) =>
      current.map((user) =>
        user.id === grant.user.id
          ? {
              ...user,
              cashBalance: data.cashBalance,
              pointBalance: data.pointBalance,
            }
          : user,
      ),
    );
    setMessage(
      `${displayName(grant.user)}님에게 ${assetLabel(grant.asset)} ${parsedAmount.toLocaleString()}을 지급했습니다.`,
    );
    setGrant(null);
    setSaving(false);
  }

  return (
    <>
      {message ? (
        <p className="mt-5 rounded-[6px] border border-[#cfe1d4] bg-[#edf6ef] px-3 py-2 text-sm text-[#356447]">
          {message}
        </p>
      ) : null}

      <div className="mt-5 overflow-x-auto rounded-[6px] border border-[#d8d2cc] bg-white">
        <table className="min-w-[880px] w-full text-left text-sm">
          <thead className="border-b border-[#ddd7d1] bg-[#f3f0ed] text-xs text-[#746e6a]">
            <tr>
              <th className="px-4 py-3 font-bold">회원</th>
              <th className="px-3 py-3 font-bold">활동</th>
              <th className="px-3 py-3 font-bold">캐시</th>
              <th className="px-3 py-3 font-bold">포인트</th>
              <th className="px-3 py-3 font-bold">가입일</th>
              <th className="px-4 py-3 text-right font-bold">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebe7e3]">
            {rows.map((user) => (
              <tr key={user.id} className="hover:bg-[#fbfaf8]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#efe5eb] text-xs font-bold text-[#6f3d5b]">
                      {displayName(user).slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="max-w-40 truncate font-bold">{displayName(user)}</p>
                        {user.role === "ADMIN" ? <span className="rounded bg-[#302c2e] px-1.5 py-0.5 text-[10px] font-bold text-white">관리자</span> : null}
                      </div>
                      <p className="mt-0.5 max-w-64 truncate text-xs text-[#817a75]">{user.email ?? "이메일 없음"} · {providerLabel(user.provider)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-xs text-[#5f5956]">
                  글 <strong>{user._count.posts}</strong> · 댓글 <strong>{user._count.comments}</strong> · 페르소나 <strong>{user._count.personas}</strong>
                </td>
                <td className="px-3 py-3 font-semibold">{user.cashBalance.toLocaleString()} C</td>
                <td className="px-3 py-3 font-semibold text-[#52745f]">{user.pointBalance.toLocaleString()} P</td>
                <td className="px-3 py-3 text-xs text-[#817a75]">{formatDate(user.createdAt)}</td>
                <td className="relative px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId((current) => (current === user.id ? null : user.id))}
                    className="grid size-8 place-items-center rounded-[6px] border border-[#d8d2cc] text-[#655f5c] hover:bg-[#f1eeeb]"
                    aria-label={`${displayName(user)} 관리 메뉴`}
                    aria-expanded={openMenuId === user.id}
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                  {openMenuId === user.id ? (
                    <div className="absolute right-4 top-11 z-20 w-36 overflow-hidden rounded-[6px] border border-[#d8d2cc] bg-white py-1 text-left shadow-lg">
                      <button type="button" onClick={() => openGrant(user, "CASH")} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[#f4f1ee]">
                        <Banknote className="size-4 text-[#6f3d5b]" /> 캐시 지급
                      </button>
                      <button type="button" onClick={() => openGrant(user, "POINT")} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[#f4f1ee]">
                        <Gift className="size-4 text-[#5f8a70]" /> 포인트 지급
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-16 text-center text-sm text-[#918a85]">검색 결과가 없습니다.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {grant ? (
        <div className="fixed inset-0 z-[70] grid place-items-center px-4">
          <button type="button" className="absolute inset-0 bg-black/45" onClick={() => setGrant(null)} aria-label="지급 창 닫기" />
          <section role="dialog" aria-modal="true" aria-labelledby="grant-title" className="relative w-full max-w-md rounded-[8px] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#e4dfda] px-5 py-4">
              <div>
                <h2 id="grant-title" className="text-lg font-bold">{assetLabel(grant.asset)} 지급</h2>
                <p className="mt-1 text-sm text-[#746e6a]">{displayName(grant.user)} · 현재 {currentBalance(grant).toLocaleString()} {grant.asset === "CASH" ? "C" : "P"}</p>
              </div>
              <button type="button" onClick={() => setGrant(null)} className="grid size-8 place-items-center rounded-[6px] text-[#746e6a] hover:bg-[#f1eeeb]" aria-label="닫기"><X className="size-4" /></button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <label className="block">
                <span className="text-sm font-bold">지급 수량</span>
                <input type="number" min={1} max={10000000} value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 h-11 w-full rounded-[6px] border border-[#d8d2cc] px-3 text-sm outline-none focus:border-[#7a4c67] focus:ring-4 focus:ring-[#7a4c67]/10" placeholder={grant.asset === "CASH" ? "예: 1000" : "예: 500"} />
              </label>
              <label className="block">
                <span className="text-sm font-bold">지급 사유</span>
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} maxLength={200} className="mt-2 w-full resize-none rounded-[6px] border border-[#d8d2cc] px-3 py-2 text-sm outline-none focus:border-[#7a4c67] focus:ring-4 focus:ring-[#7a4c67]/10" placeholder="이벤트 보상, 오류 보정 등" />
              </label>
              {error ? <p role="alert" className="rounded-[6px] bg-[#fff0ed] px-3 py-2 text-sm text-[#a33c32]">{error}</p> : null}
              <p className="text-xs leading-5 text-[#817a75]">{grant.asset === "CASH" ? "캐시는 결제로 충전되는 유료 재화입니다." : "포인트는 활동과 이벤트로 지급되는 무료 재화입니다."}</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#e4dfda] bg-[#f7f5f2] px-5 py-4">
              <button type="button" onClick={() => setGrant(null)} className="h-9 rounded-[6px] border border-[#d8d2cc] bg-white px-4 text-sm font-bold">취소</button>
              <button type="button" onClick={submitGrant} disabled={saving} className="h-9 rounded-[6px] bg-[#6f3d5b] px-4 text-sm font-bold text-white disabled:opacity-50">{saving ? "지급 중" : `${assetLabel(grant.asset)} 지급`}</button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function displayName(user: UserRow) {
  return user.nickname ?? user.name ?? "이름 없음";
}

function assetLabel(asset: "CASH" | "POINT") {
  return asset === "CASH" ? "캐시" : "포인트";
}

function currentBalance(grant: GrantState) {
  return grant.asset === "CASH" ? grant.user.cashBalance : grant.user.pointBalance;
}

function providerLabel(provider: string) {
  if (provider === "google") return "Google";
  if (provider === "kakao") return "카카오";
  return "이메일";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "2-digit", month: "numeric", day: "numeric", timeZone: "Asia/Seoul" }).format(new Date(value));
}
