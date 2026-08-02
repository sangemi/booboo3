ALTER TYPE "PostCategory" ADD VALUE 'VERDICT';

ALTER TABLE "VerdictVote" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "VerdictVote_postId_userId_key"
ON "VerdictVote"("postId", "userId");

CREATE INDEX "VerdictVote_userId_idx" ON "VerdictVote"("userId");

ALTER TABLE "VerdictVote"
ADD CONSTRAINT "VerdictVote_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
