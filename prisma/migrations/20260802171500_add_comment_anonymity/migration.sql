-- Logged-in members can still choose whether each comment shows their profile name.
ALTER TABLE "Comment" ADD COLUMN "isAnonymous" BOOLEAN NOT NULL DEFAULT true;
