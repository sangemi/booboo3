import type { Metadata } from "next";
import { Gowun_Batang, Noto_Sans_KR } from "next/font/google";

import { AuthProvider } from "@/components/auth-provider";
import { JsonLd } from "@/components/seo/json-ld";
import {
  SITE_DESCRIPTION,
  SITE_LOGO_URL,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const gowunBatang = Gowun_Batang({
  variable: "--font-display-kr",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "부부라이프 | 우리 부부 이야기",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: "부부라이프 | 우리 부부 이야기",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "부부라이프 | 우리 부부 이야기",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    apple: [
      {
        url: "/brand/booboolife-mark-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${gowunBatang.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col [overflow-wrap:break-word] [text-wrap:pretty] [white-space:normal] [word-break:keep-all]">
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: SITE_NAME,
              url: SITE_URL,
              logo: {
                "@type": "ImageObject",
                url: SITE_LOGO_URL,
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              inLanguage: "ko-KR",
              publisher: { "@id": `${SITE_URL}/#organization` },
            },
          ]}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
