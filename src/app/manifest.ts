import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "부부라이프",
    short_name: "부부라이프",
    description: "보통 부부의 일상과 대화를 나누는 커뮤니티",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf6",
    theme_color: "#6f3d5b",
    icons: [
      {
        src: "/brand/booboolife-mark-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/booboolife-mark-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
