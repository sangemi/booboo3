import type { MetadataRoute } from "next";

import { listCommunityPostSeoEntries } from "@/lib/community-service";
import { absoluteUrl, postUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const staticPages = [
  "/about",
  "/ai-operations",
  "/company/terms",
  "/company/privacy",
  "/company/privacy-collect",
  "/company/community-policy",
  "/company/youth-protection",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listCommunityPostSeoEntries();
  const latestPostUpdate = posts[0]?.pageUpdatedAt;

  return [
    {
      url: absoluteUrl("/"),
      ...(latestPostUpdate ? { lastModified: latestPostUpdate } : {}),
    },
    ...staticPages.map((path) => ({ url: absoluteUrl(path) })),
    ...posts.map((post) => ({
      url: postUrl(post.publicId),
      lastModified: post.pageUpdatedAt,
    })),
  ];
}
