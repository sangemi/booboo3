import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/booboo/site-header";
import { SiteFooter } from "@/components/booboo/site-footer";
import { prisma } from "@/lib/db";
import { dailyMissionSelection } from "@/lib/community-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "과거 미션",
  description: "부부가 함께 해본 작은 실천과 참여 후기를 만나보세요.",
  alternates: { canonical: "/missions" },
};

export default async function MissionsPage({ searchParams }: {
  searchParams: Promise<{ before?: string }>;
}) {
  const { before } = await searchParams;
  const today = dailyMissionSelection().missionDate;
  const [latestCompletion, latestReflection] = await Promise.all([
    prisma.missionCompletion.findFirst({
      where: { completedOn: { lt: today } },
      orderBy: { completedOn: "desc" },
      select: { completedOn: true },
    }),
    prisma.missionReflection.findFirst({
      where: { missionDate: { lt: today } },
      orderBy: { missionDate: "desc" },
      select: { missionDate: true },
    }),
  ]);
  const latestActivityTime = Math.max(
    latestCompletion?.completedOn.getTime() ?? 0,
    latestReflection?.missionDate.getTime() ?? 0,
  );
  const latestEnd = latestActivityTime
    ? new Date(latestActivityTime + 86_400_000)
    : today;
  const parsed = before && /^\d{4}-\d{2}-\d{2}$/.test(before)
    ? new Date(`${before}T00:00:00Z`)
    : latestEnd;
  const end = Number.isFinite(parsed.getTime()) && parsed <= today ? parsed : latestEnd;
  const isOlderPage = end < latestEnd;
  const start = new Date(end.getTime() - 30 * 86_400_000);
  const [completions, reflections] = await Promise.all([
    prisma.missionCompletion.groupBy({
      by: ["missionId", "completedOn"],
      where: { completedOn: { gte: start, lt: end } },
      _count: { _all: true },
    }),
    prisma.missionReflection.findMany({
      where: { missionDate: { gte: start, lt: end } },
      orderBy: { createdAt: "asc" },
      select: { id: true, missionId: true, missionDate: true, body: true,
        user: { select: { nickname: true, name: true } } },
    }),
  ]);
  const ids = [...new Set([...completions, ...reflections].map(item => item.missionId))];
  const records = await prisma.mission.findMany({ where: { id: { in: ids } } });
  const dates = new Map<string, { missionId: string; date: Date; count: number }>();
  for (const item of completions) {
    dates.set(`${item.missionId}:${item.completedOn.toISOString()}`, { missionId: item.missionId, date: item.completedOn, count: item._count._all });
  }
  for (const item of reflections) {
    const key = `${item.missionId}:${item.missionDate.toISOString()}`;
    if (!dates.has(key)) dates.set(key, { missionId: item.missionId, date: item.missionDate, count: 0 });
  }
  const entries = [...dates.values()].sort((a, b) => b.date.getTime() - a.date.getTime() || a.missionId.localeCompare(b.missionId));
  const earlier = await Promise.all([
    prisma.missionCompletion.findFirst({ where: { completedOn: { lt: start } }, orderBy: { completedOn: "desc" }, select: { completedOn: true } }),
    prisma.missionReflection.findFirst({ where: { missionDate: { lt: start } }, orderBy: { missionDate: "desc" }, select: { missionDate: true } }),
  ]);
  const earlierTime = Math.max(earlier[0]?.completedOn.getTime() ?? 0, earlier[1]?.missionDate.getTime() ?? 0);
  const olderBefore = new Date(earlierTime + 86_400_000).toISOString().slice(0, 10);
  const formatDate = (date: Date) => new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" }).format(date);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteHeader active="community" />
      <section className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--ink-soft)]"><ChevronLeft className="size-4" />오늘의 미션</Link>
        <h1 className="mt-5 text-2xl font-bold">과거 미션</h1>
        <div className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {entries.length === 0 ? <p className="py-12 text-center text-sm text-[var(--ink-soft)]">아직 참여 기록이 없습니다.</p> : entries.map(entry => {
            const mission = records.find(record => record.id === entry.missionId);
            const reviews = reflections.filter(review => review.missionId === entry.missionId && review.missionDate.getTime() === entry.date.getTime());
            return <details key={`${entry.missionId}:${entry.date.toISOString()}`} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div className="min-w-0"><p className="text-xs text-[var(--ink-soft)]">{formatDate(entry.date)}</p><h2 className="mt-1 break-words text-base font-bold text-[var(--foreground)]">{mission?.title ?? "지난 미션"}</h2><p className="mt-1 text-xs text-[var(--ink-soft)]">{entry.count}명 참여 · 후기 {reviews.length}개</p></div>
                <ChevronRight className="size-4 shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-4 whitespace-pre-line text-sm leading-7">{mission?.prompt}</p>
              {reviews.length > 0 ? (
                <div className="mt-5 space-y-5 border-l-2 border-[var(--leaf)] pl-4">
                  {reviews.map(review => <article key={review.id}><h3 className="text-xs font-semibold text-[var(--plum)]">{review.user.nickname ?? review.user.name ?? "부부라이프 회원"}</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-7">{review.body}</p></article>)}
                </div>
              ) : null}
            </details>;
          })}
        </div>
        <nav aria-label="미션 기록 기간" className="mt-6 flex justify-between text-sm">
          {isOlderPage ? <Link href="/missions">최근 기록</Link> : <span />}
          {earlierTime > 0 ? <Link href={`/missions?before=${olderBefore}`} className="inline-flex items-center gap-1">이전 기록<ChevronRight className="size-4" /></Link> : null}
        </nav>
      </section>
      <SiteFooter />
    </main>
  );
}
