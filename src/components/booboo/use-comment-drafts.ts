"use client";

import { useSyncExternalStore } from "react";
import { createCommentDraftStore } from "@/lib/comment-drafts";

const store = createCommentDraftStore(() => window.sessionStorage);

export function useCommentDrafts(owner: string) {
  const drafts = useSyncExternalStore(
    store.subscribe,
    () => store.get(owner),
    store.getServerSnapshot,
  );
  const setDrafts = (update: Parameters<typeof store.update>[1]) => {
    store.update(owner, update);
  };
  return [drafts, setDrafts] as const;
}
