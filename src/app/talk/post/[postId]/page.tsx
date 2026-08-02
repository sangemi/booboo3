import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BoobooApp } from "@/components/booboo/booboo-app";
import type { CategoryKey } from "@/lib/community-data";
import { getCommunityPostByPublicId } from "@/lib/community-service";

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
  const post = await getCommunityPostByPublicId(Number(postId));

  if (!post) notFound();

  return (
    <BoobooApp
      initialPost={post}
      initialCategory={normalizeCategory(category)}
    />
  );
}

function normalizeCategory(value?: string | string[]): CategoryKey {
  const category = Array.isArray(value) ? value[0] : value;
  return category === "talk" || category === "tips" ? category : "all";
}
