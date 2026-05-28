-- CreateTable
CREATE TABLE "survey_submission_teachers" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_submission_teachers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_submission_teachers_submission_id_teacher_id_key" ON "survey_submission_teachers"("submission_id", "teacher_id");

-- AddForeignKey
ALTER TABLE "survey_submission_teachers" ADD CONSTRAINT "survey_submission_teachers_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "survey_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
