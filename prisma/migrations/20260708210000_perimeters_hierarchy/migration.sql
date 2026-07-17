-- Step 1: new Perimeter-related tables

CREATE TABLE "Perimeters" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "origin" VARCHAR(100) NOT NULL,
    "color" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Perimeters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PerimeterMembers" (
    "id" TEXT NOT NULL,
    "perimeter_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerimeterMembers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherComments" (
    "id" TEXT NOT NULL,
    "Id_Teacher" TEXT NOT NULL,
    "perimeter_id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherComments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "survey_responses" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "promo_modules_id" TEXT NOT NULL,
    "response" VARCHAR(20) NOT NULL DEFAULT 'non',
    "condition_text" TEXT,

    CONSTRAINT "survey_responses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Perimeters_slug_key" ON "Perimeters"("slug");
CREATE UNIQUE INDEX "PerimeterMembers_perimeter_id_user_id_key" ON "PerimeterMembers"("perimeter_id", "user_id");
CREATE UNIQUE INDEX "TeacherComments_Id_Teacher_perimeter_id_key" ON "TeacherComments"("Id_Teacher", "perimeter_id");
CREATE UNIQUE INDEX "survey_responses_submission_id_promo_modules_id_key" ON "survey_responses"("submission_id", "promo_modules_id");

ALTER TABLE "PerimeterMembers" ADD CONSTRAINT "PerimeterMembers_perimeter_id_fkey" FOREIGN KEY ("perimeter_id") REFERENCES "Perimeters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PerimeterMembers" ADD CONSTRAINT "PerimeterMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("Id_Users") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherComments" ADD CONSTRAINT "TeacherComments_Id_Teacher_fkey" FOREIGN KEY ("Id_Teacher") REFERENCES "Teacher"("Id_Teacher") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherComments" ADD CONSTRAINT "TeacherComments_perimeter_id_fkey" FOREIGN KEY ("perimeter_id") REFERENCES "Perimeters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 2: bootstrap the "devdata" perimeter that all existing data migrates under

INSERT INTO "Perimeters" ("id", "title", "slug", "origin", "color", "created_at")
VALUES ('00000000-0000-0000-0000-000000000001', 'Dev Data', 'devdata', 'SYSTEME', '#2563EB', CURRENT_TIMESTAMP);

INSERT INTO "PerimeterMembers" ("id", "perimeter_id", "user_id", "joined_at")
SELECT gen_random_uuid(), '00000000-0000-0000-0000-000000000001', "Id_Users", CURRENT_TIMESTAMP FROM "Users";

-- Step 3: add new columns as nullable, backfill, then enforce NOT NULL + FKs

ALTER TABLE "Modules" ADD COLUMN "avec_mentor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "description" TEXT,
ADD COLUMN "perimeter_id" TEXT,
ADD COLUMN "periode" VARCHAR(100),
ALTER COLUMN "name" TYPE VARCHAR(255);

UPDATE "Modules" SET "perimeter_id" = '00000000-0000-0000-0000-000000000001';

ALTER TABLE "Modules" ALTER COLUMN "perimeter_id" SET NOT NULL;
ALTER TABLE "Modules" ADD CONSTRAINT "Modules_perimeter_id_fkey" FOREIGN KEY ("perimeter_id") REFERENCES "Perimeters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Promos" ADD COLUMN "perimeter_id" TEXT,
ADD COLUMN "survey_introduction" TEXT,
ADD COLUMN "survey_title" VARCHAR(255);

UPDATE "Promos" SET "perimeter_id" = '00000000-0000-0000-0000-000000000001';

ALTER TABLE "Promos" ALTER COLUMN "perimeter_id" SET NOT NULL;
ALTER TABLE "Promos" ADD CONSTRAINT "Promos_perimeter_id_fkey" FOREIGN KEY ("perimeter_id") REFERENCES "Perimeters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Users" ADD COLUMN "active_perimeter_id" TEXT;
UPDATE "Users" SET "active_perimeter_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "Users" ADD CONSTRAINT "Users_active_perimeter_id_fkey" FOREIGN KEY ("active_perimeter_id") REFERENCES "Perimeters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: survey_submissions gets its perimeter, uniqueness moves from global email to (perimeter, email)

DROP INDEX "survey_submissions_email_key";
ALTER TABLE "survey_submissions" ADD COLUMN "perimeter_id" TEXT;
UPDATE "survey_submissions" SET "perimeter_id" = '00000000-0000-0000-0000-000000000001';
ALTER TABLE "survey_submissions" ALTER COLUMN "perimeter_id" SET NOT NULL;
ALTER TABLE "survey_submissions" ADD CONSTRAINT "survey_submissions_perimeter_id_fkey" FOREIGN KEY ("perimeter_id") REFERENCES "Perimeters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "survey_submissions_perimeter_id_email_key" ON "survey_submissions"("perimeter_id", "email");

-- Step 5: survey_responses foreign keys (rows are populated by the data-migration script)

ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "survey_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_promo_modules_id_fkey" FOREIGN KEY ("promo_modules_id") REFERENCES "PromoModules"("Id_PromoModules") ON DELETE CASCADE ON UPDATE CASCADE;

-- NOTE: "Teacher"."comments" and the legacy "survey_categories"/"survey_subjects"/"survey_subject_responses"
-- tables are intentionally NOT dropped here. They are dropped by the follow-up migration
-- (20260708210100_drop_legacy_survey_and_comments) after `prisma/migrate-to-perimeters.ts`
-- has copied their data into TeacherComments / Promos / Modules / PromoModules / survey_responses.
