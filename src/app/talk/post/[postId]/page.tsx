import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BoobooApp } from "@/components/booboo/booboo-app";
import { getCommunityPostByPublicId } from "@/lib/community-service";

type PostPageProps = {
  params: Promise<{ postId: string }>;
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

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  const post = await getCommunityPostByPublicId(Number(postId));

  if (!post) notFound();

  return <BoobooApp initialPost={post} />;
}
