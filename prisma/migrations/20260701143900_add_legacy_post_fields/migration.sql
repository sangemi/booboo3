-- Add temporary booboo2 compatibility fields for migrated legacy posts/comments.
-- These columns support old URLs such as /talk/post/13739 during the migration window.

ALTER TABLE "Post"
ADD COLUMN "legacyId" INTEGER,
ADD COLUMN "legacyPath" TEXT,
ADD COLUMN "legacySource" TEXT,
ADD COLUMN "legacyViewCount" INTEGER,
ADD COLUMN "legacyLikeCount" INTEGER,
ADD COLUMN "legacyDislikeCount" INTEGER,
ADD COLUMN "legacyCreatedAt" TIMESTAMP(3);

ALTER TABLE "Comment"
ADD COLUMN "legacyId" INTEGER,
ADD COLUMN "legacySource" TEXT,
ADD COLUMN "legacyCreatedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Post_legacyId_key" ON "Post"("legacyId");
CREATE UNIQUE INDEX "Post_legacyPath_key" ON "Post"("legacyPath");
CREATE INDEX "Post_legacyId_idx" ON "Post"("legacyId");

CREATE UNIQUE INDEX "Comment_legacyId_key" ON "Comment"("legacyId");
CREATE INDEX "Comment_legacyId_idx" ON "Comment"("legacyId");
