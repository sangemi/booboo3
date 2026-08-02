CREATE TYPE "LetterReactionType" AS ENUM ('UP', 'DOWN');

CREATE TABLE "LetterReaction" (
    "id" TEXT NOT NULL,
    "letterId" TEXT NOT NULL,
    "anonKey" TEXT NOT NULL,
    "type" "LetterReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LetterReaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LetterReaction_letterId_anonKey_key"
ON "LetterReaction"("letterId", "anonKey");

CREATE INDEX "LetterReaction_letterId_type_idx"
ON "LetterReaction"("letterId", "type");

ALTER TABLE "LetterReaction"
ADD CONSTRAINT "LetterReaction_letterId_fkey"
FOREIGN KEY ("letterId") REFERENCES "AnonymousLetter"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
