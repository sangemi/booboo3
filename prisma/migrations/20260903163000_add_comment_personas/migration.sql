ALTER TABLE "Post"
ADD COLUMN "commentPersonaRequests" JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE "Comment"
ADD COLUMN "personaSnapshots" JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE "Post"
SET "commentPersonaRequests" = '[{"type":"GENDER","level":"REQUESTED"},{"type":"AGE_GROUP","level":"REQUESTED"},{"type":"MARRIAGE_YEARS","level":"REQUESTED"}]'::jsonb
WHERE "showCommenterGender" = true
  AND "commentPersonaRequests" = '[]'::jsonb;
