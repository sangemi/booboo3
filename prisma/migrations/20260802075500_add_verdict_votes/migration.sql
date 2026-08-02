-- Store "누가 더 잘못했나요?" post verdict votes.
CREATE TYPE "VerdictChoice" AS ENUM ('HUSBAND', 'WIFE', 'BOTH', 'NOT_ENOUGH');

CREATE TABLE "VerdictVote" (
    "id" TEXT NOT NULL,
    "choice" "VerdictChoice" NOT NULL,
    "postId" TEXT NOT NULL,
    "anonKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerdictVote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VerdictVote_postId_choice_idx" ON "VerdictVote"("postId", "choice");
CREATE INDEX "VerdictVote_createdAt_idx" ON "VerdictVote"("createdAt");

ALTER TABLE "VerdictVote" ADD CONSTRAINT "VerdictVote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
