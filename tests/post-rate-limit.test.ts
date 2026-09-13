import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loadEnvFile } from "node:process";
import { after, before, test } from "node:test";
import { Client } from "pg";
import { postIpHash, postRetryAfterSeconds } from "../src/lib/post-rate-limit";

loadEnvFile(".env");
const schema = `booboo_post_limit_test_${randomUUID().replaceAll("-", "")}`;
const connectionString = process.env.DATABASE_URL!;
const clients = [new Client({ connectionString }), new Client({ connectionString })];

before(async () => {
  assert.match(schema, /^booboo_post_limit_test_[a-f0-9]{32}$/);
  await Promise.all(clients.map((client) => client.connect()));
  await clients[0].query(`CREATE SCHEMA "${schema}"`);
  await clients[0].query(`CREATE TABLE "${schema}"."PostRateLimit" (
    "ipHash" text PRIMARY KEY, "lastPostedAt" timestamp(3) NOT NULL
  )`);
  await Promise.all(clients.map((client) => client.query(`SET search_path TO "${schema}"`)));
});

after(async () => {
  assert.match(schema, /^booboo_post_limit_test_[a-f0-9]{32}$/);
  await clients[0].query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await Promise.all(clients.map((client) => client.end()));
});

test("IP는 원문 대신 안정적인 HMAC으로 변환한다", () => {
  const first = postIpHash("203.0.113.1", "test-secret");
  assert.equal(first, postIpHash("203.0.113.1", "test-secret"));
  assert.notEqual(first, postIpHash("203.0.113.2", "test-secret"));
  assert.equal(postIpHash("not-an-ip", "test-secret"), null);
  assert.equal(postRetryAfterSeconds(new Date(Date.now() - 60_000)), 120);
});

test("같은 IP의 동시 작성은 한 건만 허용하고 3분 후 다시 허용한다", async () => {
  const attempt = (client: Client, ipHash: string) => client.query(`
    INSERT INTO "PostRateLimit" ("ipHash", "lastPostedAt")
    VALUES ($1, CURRENT_TIMESTAMP)
    ON CONFLICT ("ipHash") DO UPDATE
    SET "lastPostedAt" = EXCLUDED."lastPostedAt"
    WHERE "PostRateLimit"."lastPostedAt" <= CURRENT_TIMESTAMP - INTERVAL '3 minutes'
    RETURNING 1 AS accepted
  `, [ipHash]);
  const [a, b] = await Promise.all(clients.map((client) => attempt(client, "same-ip")));
  assert.equal((a.rowCount ?? 0) + (b.rowCount ?? 0), 1);
  assert.equal((await attempt(clients[0], "same-ip")).rowCount, 0);
  assert.equal((await attempt(clients[1], "other-ip")).rowCount, 1);
  await clients[0].query(`UPDATE "PostRateLimit" SET "lastPostedAt" = CURRENT_TIMESTAMP - INTERVAL '3 minutes 1 second' WHERE "ipHash" = 'same-ip'`);
  assert.equal((await attempt(clients[0], "same-ip")).rowCount, 1);
});
