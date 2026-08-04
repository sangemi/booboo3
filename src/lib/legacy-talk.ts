export type LegacyTalkSearchParams = Record<
  string,
  string | string[] | undefined
>;

const LEGACY_TALK_ORIGIN = "https://v1.booboolife.com";

export function legacyTalkUrl(
  pathSegments: string[],
  searchParams: LegacyTalkSearchParams = {},
) {
  const path = pathSegments.map(encodeURIComponent).join("/");
  const url = new URL(`/talk/${path}`, LEGACY_TALK_ORIGIN);

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item));
    } else if (value !== undefined) {
      url.searchParams.append(key, value);
    }
  }

  return url.toString();
}
