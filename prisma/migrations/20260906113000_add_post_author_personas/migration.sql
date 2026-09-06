ALTER TABLE "Post"
ADD COLUMN "authorPersonaSnapshots" JSONB NOT NULL DEFAULT '[]'::jsonb;
