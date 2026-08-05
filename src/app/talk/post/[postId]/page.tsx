import type { Metadata } from "next";
import { cookies } from "next/headers";
import { permanentRedirect } from "next/navigation";

import { auth } from "@/auth";
import { BoobooApp } from "@/components/booboo/booboo-app";
import { JsonLd } from "@/components/seo/json-ld";
import {
  categoryLabels,
  type CategoryKey,
  dailyMissionSelection,
  letters as seedLetters,
  seedPosts,
} from "@/lib/community-data";
import {
  categoryFromDb,
  getCommunityPostByPublicId,
  getCommunityPostSeoByPublicId,
  getTodayCommunityMission,
  listAnonymousLetters,
  listCommunityPosts,
} from "@/lib/community-service";
import {
  legacyTalkUrl,
  type LegacyTalkSearchParams,
} from "@/lib/legacy-talk";
import { SITE_NAME, SITE_URL, postUrl, seoDescription } from "@/lib/seo";

type PostPageProps = {
  params: Promise<{ postId: string }>;
  searchParams: Promise<LegacyTalkSearchParams>;
};

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await getCommunityPostSeoByPublicId(Number(postId));

  if (!post) {
    return {
      title: "글을 찾을 수 없습니다",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: post.title,
    description: seoDescription(post.body),
    alternates: {
      canonical: `/talk/post/${post.publicId}`,
    },
    openGraph: {
      type: "article",
      locale: "ko_KR",
      siteName: SITE_NAME,
      title: post.title,
      description: seoDescription(post.body),
      url: `/talk/post/${post.publicId}`,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.pageUpdatedAt.toISOString(),
      authors: [post.authorName],
      section: categoryLabels[categoryFromDb[post.category]],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: seoDescription(post.body),
    },
  };
}

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const { postId } = await params;
  const resolvedSearchParams = await searchParams;
  const { category } = resolvedSearchParams;
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

  if (!post) {
    permanentRedirect(
      legacyTalkUrl(["post", postId], resolvedSearchParams),
    );
  }

  const initialPosts = posts.some((item) => item.id === post.id)
    ? posts
    : [post, ...posts];

  const url = postUrl(post.publicId);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "@id": `${url}#post`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    text: post.body,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.createdAtIso,
    dateModified: post.updatedAtIso,
    commentCount: post.comments.length,
    comment: post.comments.map((comment) => ({
      "@type": "Comment",
      "@id": `${url}#comment-${comment.id}`,
      text: comment.body,
      author: {
        "@type": "Person",
        name: comment.author,
      },
      datePublished: comment.createdAtIso,
      dateModified: comment.updatedAtIso,
      url: `${url}#comment-${comment.id}`,
      ...(comment.upvotes
        ? {
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/LikeAction",
              userInteractionCount: comment.upvotes,
            },
          }
        : {}),
    })),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/CommentAction",
      userInteractionCount: post.comments.length,
    },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "ko-KR",
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <BoobooApp
        initialPost={post}
        initialPosts={initialPosts}
        initialLetters={letters}
        initialMission={mission}
        initialCategory={normalizeCategory(category)}
      />
    </>
  );
}

function normalizeCategory(value?: string | string[]): CategoryKey {
  const category = Array.isArray(value) ? value[0] : value;
  return category === "talk" || category === "verdict" || category === "tips"
    ? category
    : "all";
}
