import { categoryLabels } from "@/lib/community-data";
import {
  categoryFromDb,
  listCommunityFeedPosts,
} from "@/lib/community-service";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  escapeXml,
  postUrl,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await listCommunityFeedPosts();
  const feedUrl = absoluteUrl("/feed.xml");
  const lastBuildDate = posts[0]?.updatedAt ?? new Date();

  const items = posts
    .map((post) => {
      const url = postUrl(post.publicId);
      const category = categoryLabels[categoryFromDb[post.category]];

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${post.createdAt.toUTCString()}</pubDate>
      <dc:creator>${escapeXml(post.authorName)}</dc:creator>
      <category>${escapeXml(category)}</category>
      <description>${escapeXml(post.body)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>ko-KR</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
