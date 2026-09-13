CREATE TABLE "PostRateLimit" (
    "ipHash" TEXT NOT NULL,
    "lastPostedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PostRateLimit_pkey" PRIMARY KEY ("ipHash")
);
CREATE INDEX "PostRateLimit_lastPostedAt_idx" ON "PostRateLimit"("lastPostedAt");
