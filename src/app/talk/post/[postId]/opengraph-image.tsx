import { ImageResponse } from "next/og";

import { categoryLabels } from "@/lib/community-data";
import {
  categoryFromDb,
  getCommunityPostSeoByPublicId,
} from "@/lib/community-service";
import { SITE_LOGO_URL, SITE_NAME } from "@/lib/seo";

export const alt = "부부라이프 게시글";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PostOpenGraphImage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const post = await getCommunityPostSeoByPublicId(Number(postId));
  const title = post?.title ?? "우리 부부 이야기";
  const category = post
    ? categoryLabels[categoryFromDb[post.category]]
    : "커뮤니티";
  const titleSize = title.length > 56 ? 46 : title.length > 34 ? 54 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#fbf8f5",
          color: "#332c2f",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "68px 78px",
          width: "100%",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              background: "#efe3e7",
              borderRadius: 8,
              color: "#70415d",
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              padding: "11px 18px",
            }}
          >
            {category}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" height={72} src={SITE_LOGO_URL} width={72} />
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 800,
            lineHeight: 1.35,
            maxWidth: 1030,
          }}
        >
          {title}
        </div>
        <div
          style={{
            alignItems: "center",
            borderTop: "2px solid #e8ded8",
            color: "#6f6467",
            display: "flex",
            fontSize: 27,
            fontWeight: 700,
            justifyContent: "space-between",
            paddingTop: 24,
          }}
        >
          <span>{SITE_NAME}</span>
          <span>booboolife.com</span>
        </div>
      </div>
    ),
    size,
  );
}
