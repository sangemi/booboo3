CREATE TYPE "CommentReactionType" AS ENUM ('UP', 'DOWN');

ALTER TABLE "Comment" ADD COLUMN "anonKey" TEXT;

CREATE TABLE "CommentReaction" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "actorKey" TEXT NOT NULL,
    "type" "CommentReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Comment_authorId_createdAt_idx" ON "Comment"("authorId", "createdAt");
CREATE INDEX "Comment_anonKey_createdAt_idx" ON "Comment"("anonKey", "createdAt");
CREATE UNIQUE INDEX "CommentReaction_commentId_actorKey_key" ON "CommentReaction"("commentId", "actorKey");
CREATE INDEX "CommentReaction_commentId_type_idx" ON "CommentReaction"("commentId", "type");

ALTER TABLE "CommentReaction"
ADD CONSTRAINT "CommentReaction_commentId_fkey"
FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
