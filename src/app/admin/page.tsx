import {
  Coins,
  FileText,
  Gift,
  MessageCircle,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";

import { getAdminActivityDays } from "@/lib/admin-analytics";
import { categoryLabels } from "@/lib/community-data";
import { categoryFromDb } from "@/lib/community-service";
import { prisma } from "@/lib/db";

export default async function AdminOverviewPage() {
  const today = startOfKoreanDay();
  const sevenDaysAgo = startOfKoreanDay(6);

  const [
    totalUsers,
    todayUsers,
    weeklyUsers,
    totalPosts,
    todayPosts,
    totalComments,
    totalLetters,
    balances,
    categoryCounts,
    activityDays,
    latestUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.post.count(),
    prisma.post.count({ where: { createdAt: { gte: today } } }),
    prisma.comment.count(),
    prisma.anonymousLetter.count(),
    prisma.user.aggregate({
      _sum: { cashBalance: true, pointBalance: true },
    }),
    prisma.post.groupBy({ by: ["category"], _count: { _all: true } }),
    getAdminActivityDays(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        nickname: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { posts: true, comments: true } },
      },
    }),
  ]);

  const maxActivity = Math.max(
    ...activityDays.flatMap((day) => [day.signups, day.visitors]),
    1,
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-7 md:py-8">
      <div>
        <h1 className="text-xl font-bold text-[#302c2e]">운영 현황</h1>
        <p className="mt-1 text-sm text-[#746e6a]">
          가입과 커뮤니티 활동을 실제 데이터로 확인합니다.
        </p>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="핵심 통계">
        <Metric icon={Users} label="전체 회원" value={`${totalUsers.toLocaleString()}명`} note={`오늘 +${todayUsers.toLocaleString()}`} />
        <Metric icon={UserPlus} label="최근 7일 가입" value={`${weeklyUsers.toLocaleString()}명`} note="한국 시간 기준" />
        <Metric icon={FileText} label="게시글" value={`${totalPosts.toLocaleString()}개`} note={`오늘 +${todayPosts.toLocaleString()}`} />
        <Metric icon={MessageCircle} label="댓글" value={`${totalComments.toLocaleString()}개`} note={`익명 편지 ${totalLetters.toLocaleString()}개`} />
      </section>

      <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <section className="min-w-0 border-t border-[#d8d2cc] pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">최근 14일 가입과 방문</h2>
              <p className="mt-1 text-xs text-[#817a75]">관리자 방문 제외 · 한국 시간 기준</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-[#655f5c]" aria-label="그래프 범례">
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 bg-[#7a4c67]" />회원가입</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2.5 bg-[#5f8a70]" />방문자</span>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto pb-1">
            <div className="flex h-48 min-w-[620px] items-end gap-1.5 border-b border-[#d8d2cc] px-1">
              {activityDays.map((day) => (
                <div key={day.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[9px] font-bold text-[#655f5c]">{day.signups}/{day.visitors}</span>
                  <div className="flex h-32 w-full max-w-9 items-end justify-center gap-0.5">
                    <div
                      className="w-2.5 bg-[#7a4c67]"
                      style={{ height: day.signups ? `${Math.max(3, (day.signups / maxActivity) * 128)}px` : 0 }}
                      title={`${day.label} 회원가입 ${day.signups}명`}
                    />
                    <div
                      className="w-2.5 bg-[#5f8a70]"
                      style={{ height: day.visitors ? `${Math.max(3, (day.visitors / maxActivity) * 128)}px` : 0 }}
                      title={`${day.label} 방문자 ${day.visitors}명`}
                    />
                  </div>
                  <span className="text-[9px] text-[#8e8782]">{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#d8d2cc] pt-5">
          <h2 className="text-base font-bold">게시판별 글</h2>
          <div className="mt-3 divide-y divide-[#e4dfda]">
            {categoryCounts
              .sort((a, b) => b._count._all - a._count._all)
              .map((item) => (
                <div key={item.category} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-[#5f5956]">{categoryLabels[categoryFromDb[item.category]]}</span>
                  <strong>{item._count._all.toLocaleString()}개</strong>
                </div>
              ))}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <section className="border-t border-[#d8d2cc] pt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">최근 가입 회원</h2>
            <Link href="/admin/users" className="text-xs font-bold text-[#6f3d5b] hover:underline">전체 보기</Link>
          </div>
          <div className="mt-3 divide-y divide-[#e4dfda] border-y border-[#d8d2cc] bg-white">
            {latestUsers.map((user) => (
              <div key={user.id} className="grid gap-1 px-3 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{user.nickname ?? user.name ?? "이름 없음"}</p>
                  <p className="mt-0.5 truncate text-xs text-[#817a75]">{user.email ?? "이메일 없음"}</p>
                </div>
                <p className="text-xs text-[#817a75]">글 {user._count.posts} · 댓글 {user._count.comments}</p>
                <time className="text-xs text-[#817a75]">{formatDate(user.createdAt)}</time>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-[#d8d2cc] pt-5">
          <h2 className="text-base font-bold">재화 잔액</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Balance icon={Coins} label="캐시" value={`${(balances._sum.cashBalance ?? 0).toLocaleString()} C`} note="유료 재화" />
            <Balance icon={Gift} label="포인트" value={`${(balances._sum.pointBalance ?? 0).toLocaleString()} P`} note="무료 보상" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof Users; label: string; value: string; note: string }) {
  return (
    <div className="rounded-[6px] border border-[#ddd7d1] bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#746e6a]">{label}</p>
        <Icon className="size-4 text-[#7a4c67]" />
      </div>
      <p className="mt-3 text-2xl font-bold text-[#302c2e]">{value}</p>
      <p className="mt-1 text-xs text-[#918a85]">{note}</p>
    </div>
  );
}

function Balance({ icon: Icon, label, value, note }: { icon: typeof Coins; label: string; value: string; note: string }) {
  return (
    <div className="rounded-[6px] border border-[#ddd7d1] bg-white p-4">
      <Icon className="size-4 text-[#5f8a70]" />
      <p className="mt-3 text-xs font-bold text-[#746e6a]">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
      <p className="mt-1 text-[11px] text-[#918a85]">{note}</p>
    </div>
  );
}

function startOfKoreanDay(daysAgo = 0) {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const start = new Date(`${date}T00:00:00+09:00`);
  start.setUTCDate(start.getUTCDate() - daysAgo);
  return start;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(date);
}
