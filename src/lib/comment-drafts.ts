type Drafts = Record<string, string>;
type Update = Drafts | ((current: Drafts) => Drafts);
const emptyDrafts: Drafts = {};

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function createCommentDraftStore(storage?: () => DraftStorage) {
  const drafts = new Map<string, Drafts>();
  const listeners = new Set<() => void>();
  const key = (owner: string) => `booboolife:comment-drafts:${owner}`;
  function get(owner: string): Drafts {
    if (!drafts.has(owner)) {
      let restored = emptyDrafts;
      try {
        const value: unknown = JSON.parse(storage?.().getItem(key(owner)) ?? "null");
        if (value && typeof value === "object" && !Array.isArray(value)) {
          restored = Object.fromEntries(Object.entries(value).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ));
        }
      } catch { /* Storage may be unavailable in private browsing. */ }
      drafts.set(owner, restored);
    }
    return drafts.get(owner)!;
  }
  return {
    get,
    getServerSnapshot: () => emptyDrafts,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    update(owner: string, update: Update) {
      const current = get(owner);
      const next = typeof update === "function" ? update(current) : update;
      drafts.set(owner, Object.fromEntries(
        Object.entries(next).filter(([, value]) => value.length > 0),
      ));
      try {
        if (Object.keys(drafts.get(owner)!).length) {
          storage?.().setItem(key(owner), JSON.stringify(drafts.get(owner)));
        } else {
          storage?.().removeItem(key(owner));
        }
      } catch { /* Keep the in-memory draft if storage is blocked or full. */ }
      listeners.forEach((listener) => listener());
    },
  };
}
