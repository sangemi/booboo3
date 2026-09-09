import assert from "node:assert/strict";
import { test } from "node:test";
import { canReadPostViews, postViewKey, siteVisitKey } from "../src/lib/post-view-policy";

test("only the designated email may read view counts", () => {
  assert.equal(canReadPostViews("sangemi@daum.net"), true);
  assert.equal(canReadPostViews("SANGEMI@DAUM.NET"), true);
  assert.equal(canReadPostViews("ksaksk2112@gmail.com"), true);
  for (const email of [undefined, null, "", "admin@daum.net", "sangemi@daum.net.example.com"]) {
    assert.equal(canReadPostViews(email), false);
  }
});

test("site visit keys deduplicate a visitor across pages on the same Korean day", () => {
  const first = new Date("2026-09-08T15:00:00Z");
  const last = new Date("2026-09-09T14:59:59Z");
  const next = new Date("2026-09-09T15:00:00Z");
  assert.equal(siteVisitKey("anon:one", first), siteVisitKey("anon:one", last));
  assert.notEqual(siteVisitKey("anon:one", first), siteVisitKey("anon:one", next));
  assert.notEqual(siteVisitKey("anon:one", first), siteVisitKey("anon:two", first));
});

test("view keys deduplicate per post and visitor on a Korean calendar day", () => {
  const first = new Date("2026-09-08T15:00:00Z");
  const last = new Date("2026-09-09T14:59:59Z");
  const next = new Date("2026-09-09T15:00:00Z");
  assert.equal(postViewKey("post", "visitor", first), postViewKey("post", "visitor", last));
  assert.notEqual(postViewKey("post", "visitor", first), postViewKey("post", "visitor", next));
  assert.notEqual(postViewKey("post", "visitor", first), postViewKey("other", "visitor", first));
  assert.notEqual(postViewKey("post", "visitor", first), postViewKey("post", "other", first));
});
