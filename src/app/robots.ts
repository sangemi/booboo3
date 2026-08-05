import type { MetadataRoute } from "next";

import { SITE_URL, absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/mypage/", "/login", "/register"],
    },
    host: SITE_URL,
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
