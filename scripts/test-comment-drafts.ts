import assert from "node:assert/strict";
import { createCommentDraftStore } from "../src/lib/comment-drafts";

const store = createCommentDraftStore();
let notifications = 0;
const unsubscribe = store.subscribe(() => { notifications += 1; });
store.update("visitor", { post1: "first\nsecond", post2: "other post" });
assert.equal(store.get("visitor").post1, "first\nsecond");
assert.deepEqual(store.get("member:one"), {});
assert.equal(store.get("visitor"), store.get("visitor"));
assert.deepEqual(store.getServerSnapshot(), {});
store.update("visitor", (current) => ({ ...current, post1: "" }));
assert.deepEqual(store.get("visitor"), { post2: "other post" });
store.update("member:one", { post1: "private draft" });
assert.deepEqual(store.get("member:two"), {});
assert.equal(store.get("visitor").post2, "other post");
assert.equal(notifications, 3);
unsubscribe();
store.update("visitor", {});
assert.equal(notifications, 3);
assert.deepEqual(createCommentDraftStore().get("member:one"), {});
const saved = new Map<string, string>();
const storage = {
  getItem: (key: string) => saved.get(key) ?? null,
  setItem: (key: string, value: string) => { saved.set(key, value); },
  removeItem: (key: string) => { saved.delete(key); },
};
const beforeNavigation = createCommentDraftStore(() => storage);
beforeNavigation.update("visitor", { post1: "retained across document navigation" });
const afterNavigation = createCommentDraftStore(() => storage);
assert.equal(afterNavigation.get("visitor").post1, "retained across document navigation");
assert.deepEqual(afterNavigation.get("member:one"), {});
afterNavigation.update("visitor", { post1: "" });
assert.equal(saved.size, 0);
saved.set("booboolife:comment-drafts:visitor", "invalid json");
assert.deepEqual(createCommentDraftStore(() => storage).get("visitor"), {});
const blockedStorage = createCommentDraftStore(() => { throw new Error("blocked"); });
blockedStorage.update("visitor", { post1: "still works" });
assert.equal(blockedStorage.get("visitor").post1, "still works");
console.log("Comment drafts: navigation lifetime, owner isolation, multiline and clearing passed.");
