-- Keep CUID primary keys for internal relations, and expose a compact sequence
-- only for permanent public post URLs.
CREATE SEQUENCE "Post_publicId_seq";

ALTER TABLE "Post" ADD COLUMN "publicId" INTEGER;

-- Preserve the simple IDs of the original booboo3 seed posts.
UPDATE "Post" SET "publicId" = 1 WHERE "id" = 'p1';
UPDATE "Post" SET "publicId" = 2 WHERE "id" = 'p2';
UPDATE "Post" SET "publicId" = 3 WHERE "id" = 'p3';
UPDATE "Post" SET "publicId" = 4 WHERE "id" = 'p4';
UPDATE "Post" SET "publicId" = 5 WHERE "id" = 'p5';

-- A migrated post keeps its old numeric URL as its permanent public ID.
UPDATE "Post"
SET "publicId" = "legacyId"
WHERE "legacyId" IS NOT NULL AND "publicId" IS NULL;

-- Existing non-legacy posts continue after the highest reserved public ID.
SELECT setval(
  '"Post_publicId_seq"',
  GREATEST(COALESCE((SELECT MAX("publicId") FROM "Post"), 0) + 1, 1),
  false
);

WITH pending AS (
  SELECT "id"
  FROM "Post"
  WHERE "publicId" IS NULL
  ORDER BY "createdAt", "id"
)
UPDATE "Post" AS post
SET "publicId" = nextval('"Post_publicId_seq"')
FROM pending
WHERE post."id" = pending."id";

SELECT setval(
  '"Post_publicId_seq"',
  GREATEST(COALESCE((SELECT MAX("publicId") FROM "Post"), 1), 1),
  true
);

ALTER SEQUENCE "Post_publicId_seq" OWNED BY "Post"."publicId";
ALTER TABLE "Post"
  ALTER COLUMN "publicId" SET DEFAULT nextval('"Post_publicId_seq"'),
  ALTER COLUMN "publicId" SET NOT NULL;

CREATE UNIQUE INDEX "Post_publicId_key" ON "Post"("publicId");
