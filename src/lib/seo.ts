export const SITE_URL = "https://booboolife.com";
export const SITE_NAME = "부부라이프";
export const SITE_DESCRIPTION =
  "행복한 부부의 일상에서 배우고, 다툼 뒤에는 건강하게 다시 대화하는 법을 나누는 부부 커뮤니티";
export const SITE_LOGO_URL = `${SITE_URL}/brand/booboolife-mark-512.png`;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function postUrl(publicId: number) {
  return absoluteUrl(`/talk/post/${publicId}`);
}

export function seoDescription(body: string, maxLength = 155) {
  const normalized = body.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function safeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
