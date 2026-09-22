import assert from "node:assert/strict";
import config from "../next.config";
import { legacyTalkUrl } from "../src/lib/legacy-talk";

async function main() {
  const redirects = await config.redirects!();
  assert.deepEqual(redirects, [
    { source: "/talk", destination: "/", permanent: true },
  ]);
  assert.equal(
    legacyTalkUrl(["post", "9807"]),
    "https://v1.booboolife.com/talk/post/9807",
  );
  console.log("Legacy board home redirects to current home; article archive unchanged.");
}

void main();
