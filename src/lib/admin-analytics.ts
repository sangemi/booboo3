import { prisma } from "@/lib/db";

export type ActivityDay = { label: string; signups: number; visitors: number };

const KOREA_OFFSET_MS = 9 * 60 * 60 * 1000;

function koreanDateKey(date: Date) {
  return new Date(date.getTime() + KOREA_OFFSET_MS).toISOString().slice(0, 10);
}

export async function getAdminActivityDays(now = new Date()) {
  const koreanToday = koreanDateKey(now);
  const rangeStart = new Date(`${koreanToday}T00:00:00+09:00`);
  rangeStart.setUTCDate(rangeStart.getUTCDate() - 13);

  const [users, visits] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: rangeStart } }, select: { createdAt: true } }),
    prisma.siteVisit.findMany({ where: { createdAt: { gte: rangeStart } }, select: { createdAt: true } }),
  ]);
  const signups = new Map<string, number>();
  const visitors = new Map<string, number>();
  for (const user of users) signups.set(koreanDateKey(user.createdAt), (signups.get(koreanDateKey(user.createdAt)) ?? 0) + 1);
  for (const visit of visits) visitors.set(koreanDateKey(visit.createdAt), (visitors.get(koreanDateKey(visit.createdAt)) ?? 0) + 1);

  return Array.from({ length: 14 }, (_, index): ActivityDay => {
    const day = new Date(rangeStart);
    day.setUTCDate(day.getUTCDate() + index);
    const key = koreanDateKey(day);
    return { label: key.slice(5).replace("-", "/"), signups: signups.get(key) ?? 0, visitors: visitors.get(key) ?? 0 };
  });
}
