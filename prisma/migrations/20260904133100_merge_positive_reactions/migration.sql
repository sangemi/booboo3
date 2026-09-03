WITH ranked_reactions AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY
        "postId",
        CASE
          WHEN "userId" IS NOT NULL THEN 'user:' || "userId"
          ELSE 'anon:' || "anonKey"
        END
      ORDER BY "createdAt" ASC, "id" ASC
    ) AS reaction_order
  FROM "Reaction"
  WHERE
    "type" IN ('ME_TOO', 'HUG', 'HELPFUL')
    AND ("userId" IS NOT NULL OR "anonKey" IS NOT NULL)
), keeper_reactions AS (
  SELECT "id"
  FROM ranked_reactions
  WHERE reaction_order = 1
)
UPDATE "Reaction" AS reaction
SET "type" = 'EMPATHY'
FROM keeper_reactions
WHERE reaction."id" = keeper_reactions."id";

DELETE FROM "Reaction"
WHERE
  "type" IN ('ME_TOO', 'HUG', 'HELPFUL')
  AND ("userId" IS NOT NULL OR "anonKey" IS NOT NULL);

UPDATE "Reaction"
SET "type" = 'EMPATHY'
WHERE
  "type" IN ('ME_TOO', 'HUG', 'HELPFUL')
  AND "userId" IS NULL
  AND "anonKey" IS NULL;
