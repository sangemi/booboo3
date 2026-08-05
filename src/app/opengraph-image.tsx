import { ImageResponse } from "next/og";

import { SITE_DESCRIPTION, SITE_LOGO_URL, SITE_NAME } from "@/lib/seo";

export const alt = "부부라이프 - 우리 부부 이야기";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#fbf8f5",
          color: "#332c2f",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "70px 84px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            maxWidth: 930,
            textAlign: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            height={138}
            src={SITE_LOGO_URL}
            style={{ objectFit: "contain" }}
            width={138}
          />
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, marginTop: 24 }}>
            {SITE_NAME}
          </div>
          <div
            style={{
              color: "#6f6467",
              display: "flex",
              fontSize: 32,
              lineHeight: 1.5,
              marginTop: 18,
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
