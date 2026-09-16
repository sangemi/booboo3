import type { Metadata } from "next";
import { cookies } from "next/headers";

import { auth } from "@/auth";
import { BoobooApp } from "@/components/booboo/booboo-app";
import {
  CategoryKey,
  dailyMissionSelection,
  letters as seedLetters,
  seedPosts,
} from "@/lib/community-data";
import {
  countCommunityPosts,
  getTodayCommunityMission,
  listAnonymousLetters,
  listCommunityPosts,
} from "@/lib/community-service";
import { SITE_DESCRIPTION } from "@/lib/seo";
import { isAdminEmail } from "@/lib/admin-access";

export const metadata: Metadata = {
  title: { absolute: "부부라이프 | 우리 부부 이야기" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "부부라이프 | 우리 부부 이야기",
    description: SITE_DESCRIPTION,
  },
};

type HomePageProps = {
  searchParams: Promise<{
    category?: string | string[];
    page?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const [{ category, page: pageParam }, session, cookieStore] = await Promise.all([
    searchParams,
    auth(),
    cookies(),
  ]);
  const activeCategory = normalizeCategory(category);
  const page = normalizePage(pageParam);
  const [posts, totalPosts, letters, mission] = await Promise.all([
    listCommunityPosts(
      session?.user?.id,
      cookieStore.get("booboo_anon_id")?.value,
      isAdminEmail(session?.user?.email),
      page,
      activeCategory,
    ).catch(() => seedPosts),
    countCommunityPosts(activeCategory).catch(() => seedPosts.length),
    listAnonymousLetters(cookieStore.get("booboo_anon_id")?.value).catch(
      () => seedLetters,
    ),
    getTodayCommunityMission(session?.user?.id).catch(
      () => dailyMissionSelection().mission,
    ),
  ]);

  return (
    <BoobooApp
      initialPosts={posts}
      initialPostListPage={page}
      initialPostListTotal={totalPosts}
      initialLetters={letters}
      initialMission={mission}
      initialCategory={activeCategory}
    />
  );
}

function normalizeCategory(value?: string | string[]): CategoryKey {
  const category = Array.isArray(value) ? value[0] : value;
  return category === "talk" || category === "verdict" || category === "tips"
    ? category
    : "all";
}

function normalizePage(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(raw ?? "1", 10);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
