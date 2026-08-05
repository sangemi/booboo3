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
  getTodayCommunityMission,
  listAnonymousLetters,
  listCommunityPosts,
} from "@/lib/community-service";
import { SITE_DESCRIPTION } from "@/lib/seo";

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
  searchParams: Promise<{ category?: string | string[] }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const [{ category }, session, cookieStore] = await Promise.all([
    searchParams,
    auth(),
    cookies(),
  ]);
  const [posts, letters, mission] = await Promise.all([
    listCommunityPosts(
      session?.user?.id,
      cookieStore.get("booboo_anon_id")?.value,
    ).catch(() => seedPosts),
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
      initialLetters={letters}
      initialMission={mission}
      initialCategory={normalizeCategory(category)}
    />
  );
}

function normalizeCategory(value?: string | string[]): CategoryKey {
  const category = Array.isArray(value) ? value[0] : value;
  return category === "talk" || category === "verdict" || category === "tips"
    ? category
    : "all";
}
