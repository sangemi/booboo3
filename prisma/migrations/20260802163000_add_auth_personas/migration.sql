-- Add email/password authentication to the existing Auth.js user model.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- A user can carry several independently verified community personas.
CREATE TYPE "PersonaType" AS ENUM (
    'GENDER',
    'AGE_GROUP',
    'EMPLOYER',
    'PROFESSION',
    'MARRIAGE_YEARS',
    'PARENTING',
    'OTHER'
);

CREATE TYPE "PersonaVerificationStatus" AS ENUM (
    'DECLARED',
    'PENDING',
    'VERIFIED',
    'REJECTED'
);

CREATE TYPE "PersonaVerificationSource" AS ENUM (
    'SELF',
    'GOOGLE',
    'KAKAO',
    'WORK_EMAIL',
    'DOCUMENT',
    'ADMIN'
);

CREATE TYPE "PersonaReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);

CREATE TABLE "UserPersona" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PersonaType" NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "status" "PersonaVerificationStatus" NOT NULL DEFAULT 'DECLARED',
    "source" "PersonaVerificationSource" NOT NULL DEFAULT 'SELF',
    "sourceRef" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPersona_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PersonaVerification" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "source" "PersonaVerificationSource" NOT NULL,
    "status" "PersonaReviewStatus" NOT NULL DEFAULT 'PENDING',
    "sourceRef" TEXT,
    "evidence" JSONB,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonaVerification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserPersona_userId_type_normalizedValue_key"
ON "UserPersona"("userId", "type", "normalizedValue");

CREATE INDEX "UserPersona_userId_status_idx" ON "UserPersona"("userId", "status");
CREATE INDEX "PersonaVerification_personaId_createdAt_idx" ON "PersonaVerification"("personaId", "createdAt");
CREATE INDEX "PersonaVerification_status_createdAt_idx" ON "PersonaVerification"("status", "createdAt");

ALTER TABLE "UserPersona"
ADD CONSTRAINT "UserPersona_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PersonaVerification"
ADD CONSTRAINT "PersonaVerification_personaId_fkey"
FOREIGN KEY ("personaId") REFERENCES "UserPersona"("id") ON DELETE CASCADE ON UPDATE CASCADE;
