ALTER TABLE "MissionCompletion"
ADD COLUMN "completedOn" DATE;

UPDATE "MissionCompletion"
SET "completedOn" = ("completedAt" AT TIME ZONE 'Asia/Seoul')::date;

ALTER TABLE "MissionCompletion"
ALTER COLUMN "completedOn" SET NOT NULL;

CREATE UNIQUE INDEX "MissionCompletion_missionId_userId_completedOn_key"
ON "MissionCompletion"("missionId", "userId", "completedOn");

CREATE TABLE "MissionReflection" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "missionDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissionReflection_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MissionReflection_missionId_missionDate_createdAt_idx"
ON "MissionReflection"("missionId", "missionDate", "createdAt");

CREATE INDEX "MissionReflection_userId_createdAt_idx"
ON "MissionReflection"("userId", "createdAt");

ALTER TABLE "MissionReflection"
ADD CONSTRAINT "MissionReflection_missionId_fkey"
FOREIGN KEY ("missionId") REFERENCES "Mission"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MissionReflection"
ADD CONSTRAINT "MissionReflection_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Mission" ("id", "title", "prompt", "difficulty", "isActive", "createdAt")
VALUES
  ('m1', '고마움 세 문장', '오늘 고마웠던 장면을 세 문장으로 말해보기', '3분', true, CURRENT_TIMESTAMP),
  ('m2', '집안일 하나 바꾸기', '서로 가장 지친 집안일을 오늘 한 번 바꿔 맡아보기', '오늘 안에', true, CURRENT_TIMESTAMP),
  ('m3', '휴대폰 없는 차 한 잔', '알림을 끄고 10분 동안 오늘 하루만 물어보기', '10분', true, CURRENT_TIMESTAMP),
  ('m4', '먼저 안아주기', '말보다 먼저 배우자를 10초 동안 안아주기', '3분', true, CURRENT_TIMESTAMP),
  ('m5', '추억 사진 한 장', '함께 웃었던 사진 한 장을 골라 그날 이야기를 나누기', '10분', true, CURRENT_TIMESTAMP),
  ('m6', '오늘의 수고 묻기', '오늘 가장 힘들었던 순간을 묻고 답을 끊지 않고 듣기', '10분', true, CURRENT_TIMESTAMP),
  ('m7', '둘만의 짧은 산책', '집 근처를 10분만 함께 걸으며 해결책 없이 대화하기', '10분', true, CURRENT_TIMESTAMP),
  ('m8', '미뤄둔 사과 한마디', '마음에 남아 있던 작은 일 하나를 변명 없이 사과하기', '오늘 안에', true, CURRENT_TIMESTAMP),
  ('m9', '배우자 편 하나 들기', '오늘 한 번은 다른 사람 앞에서 배우자의 입장을 먼저 말해주기', '오늘 안에', true, CURRENT_TIMESTAMP),
  ('m10', '내일의 작은 약속', '내일 서로를 위해 할 수 있는 작은 일 하나를 정하기', '3분', true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "prompt" = EXCLUDED."prompt",
  "difficulty" = EXCLUDED."difficulty",
  "isActive" = true;
