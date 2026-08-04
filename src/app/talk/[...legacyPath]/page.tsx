import { permanentRedirect } from "next/navigation";

import {
  legacyTalkUrl,
  type LegacyTalkSearchParams,
} from "@/lib/legacy-talk";

type LegacyTalkPageProps = {
  params: Promise<{ legacyPath: string[] }>;
  searchParams: Promise<LegacyTalkSearchParams>;
};

export default async function LegacyTalkPage({
  params,
  searchParams,
}: LegacyTalkPageProps) {
  const [{ legacyPath }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  permanentRedirect(legacyTalkUrl(legacyPath, resolvedSearchParams));
}
