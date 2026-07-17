-- Run only after `prisma/migrate-to-perimeters.ts` has copied all legacy data into the new
-- Perimeter-scoped tables (TeacherComments, Promos, Modules, PromoModules, survey_responses).

ALTER TABLE "survey_subject_responses" DROP CONSTRAINT "survey_subject_responses_subject_id_fkey";
ALTER TABLE "survey_subject_responses" DROP CONSTRAINT "survey_subject_responses_submission_id_fkey";
ALTER TABLE "survey_subjects" DROP CONSTRAINT "survey_subjects_category_id_fkey";

DROP TABLE "survey_subject_responses";
DROP TABLE "survey_subjects";
DROP TABLE "survey_categories";

ALTER TABLE "Teacher" DROP COLUMN "comments";
ALTER TABLE "Teacher" ALTER COLUMN "phone_number" SET DATA TYPE VARCHAR(20);
