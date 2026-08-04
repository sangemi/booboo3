import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { BoobooApp } from "@/components/booboo/booboo-app";
import {
  type CategoryKey,
  dailyMissionSelection,
  letters as seedLetters,
  seedPosts,
} from "@/lib/community-data";
import {
  getCommunityPostByPublicId,
  getTodayCommunityMission,
  listAnonymousLetters,
  listCommunityPosts,
} from "@/lib/community-service";

type PostPageProps = {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await getCommunityPostByPublicId(Number(postId));

  if (!post) {
    return {
      title: "글을 찾을 수 없습니다 | 부부라이프",
    };
  }

  return {
    title: `${post.title} | 부부라이프`,
    description: post.body.slice(0, 140),
    alternates: {
      canonical: `/talk/post/${post.publicId}`,
    },
  };
}

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const { postId } = await params;
  const { category } = await searchParams;
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const [post, posts, letters, mission] = await Promise.all([
    getCommunityPostByPublicId(
      Number(postId),
      session?.user?.id,
      cookieStore.get("booboo_anon_id")?.value,
    ),
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

  if (!post) notFound();

  const initialPosts = posts.some((item) => item.id === post.id)
    ? posts
    : [post, ...posts];

  return (
    <BoobooApp
      initialPost={post}
      initialPosts={initialPosts}
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
