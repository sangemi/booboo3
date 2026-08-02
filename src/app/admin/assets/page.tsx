import { Banknote, Gift } from "lucide-react";

import { prisma } from "@/lib/db";

export default async function AdminAssetsPage() {
  const [balances, transactions] = await Promise.all([
    prisma.user.aggregate({ _sum: { cashBalance: true, pointBalance: true } }),
    prisma.walletTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        asset: true,
        type: true,
        amount: true,
        balanceAfter: true,
        reason: true,
        createdAt: true,
        user: { select: { nickname: true, name: true, email: true } },
        actor: { select: { nickname: true, name: true, email: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-7 md:py-8">
      <div>
        <h1 className="text-xl font-bold text-[#302c2e]">캐시·포인트</h1>
        <p className="mt-1 text-sm text-[#746e6a]">캐시는 결제로 충전되는 유료 재화이고, 포인트는 활동과 이벤트로 받는 무료 재화입니다.</p>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="전체 재화 잔액">
        <AssetSummary icon={Banknote} label="전체 캐시" value={`${(balances._sum.cashBalance ?? 0).toLocaleString()} C`} note="회원이 보유한 유료 재화 합계" />
        <AssetSummary icon={Gift} label="전체 포인트" value={`${(balances._sum.pointBalance ?? 0).toLocaleString()} P`} note="회원이 보유한 무료 재화 합계" />
      </section>

      <section className="mt-8 border-t border-[#d8d2cc] pt-5">
        <div className="flex items-center justify-between gap-3"><h2 className="text-base font-bold">최근 지급 원장</h2><span className="text-xs text-[#817a75]">최근 {transactions.length}건</span></div>
        <div className="mt-3 overflow-x-auto border-y border-[#d8d2cc] bg-white">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-[#ddd7d1] bg-[#f3f0ed] text-xs text-[#746e6a]"><tr><th className="px-4 py-3">회원</th><th className="px-3 py-3">재화</th><th className="px-3 py-3">지급</th><th className="px-3 py-3">지급 후 잔액</th><th className="px-3 py-3">사유</th><th className="px-3 py-3">처리자</th><th className="px-4 py-3">처리일</th></tr></thead>
            <tbody className="divide-y divide-[#ebe7e3]">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-4 py-3"><p className="font-semibold">{transaction.user.nickname ?? transaction.user.name ?? "이름 없음"}</p><p className="mt-0.5 text-xs text-[#817a75]">{transaction.user.email ?? "이메일 없음"}</p></td>
                  <td className="px-3 py-3"><span className={`rounded px-1.5 py-1 text-xs font-bold ${transaction.asset === "CASH" ? "bg-[#efe5eb] text-[#6f3d5b]" : "bg-[#e7f1ea] text-[#52745f]"}`}>{transaction.asset === "CASH" ? "캐시" : "포인트"}</span></td>
                  <td className="px-3 py-3 font-bold">+{transaction.amount.toLocaleString()} {transaction.asset === "CASH" ? "C" : "P"}</td>
                  <td className="px-3 py-3 text-[#5f5956]">{transaction.balanceAfter.toLocaleString()}</td>
                  <td className="max-w-56 px-3 py-3 text-[#5f5956]"><p className="truncate" title={transaction.reason}>{transaction.reason}</p></td>
                  <td className="px-3 py-3 text-xs text-[#655f5c]">{transaction.actor?.nickname ?? transaction.actor?.name ?? transaction.actor?.email ?? "시스템"}</td>
                  <td className="px-4 py-3 text-xs text-[#817a75]">{formatDate(transaction.createdAt)}</td>
                </tr>
              ))}
              {transactions.length === 0 ? <tr><td colSpan={7} className="px-4 py-16 text-center text-sm text-[#918a85]">아직 지급 내역이 없습니다.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AssetSummary({ icon: Icon, label, value, note }: { icon: typeof Banknote; label: string; value: string; note: string }) {
  return <div className="rounded-[6px] border border-[#ddd7d1] bg-white p-5"><div className="flex items-center gap-2 text-sm font-bold text-[#655f5c]"><Icon className="size-4 text-[#7a4c67]" />{label}</div><p className="mt-3 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-[#918a85]">{note}</p></div>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", { year: "2-digit", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" }).format(date);
}
