-- CreateTable
CREATE TABLE "survey_categories" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "level" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "specialization" VARCHAR(100),
    "sort_order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,

    CONSTRAINT "survey_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_subjects" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "volume_horaire" INTEGER NOT NULL,
    "periode" VARCHAR(100) NOT NULL,
    "avec_mentor" BOOLEAN NOT NULL DEFAULT false,
    "contenu" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "survey_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_submissions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origin" VARCHAR(255),
    "nom" VARCHAR(255) NOT NULL,
    "prenom" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telephone" VARCHAR(50) NOT NULL DEFAULT '',
    "niveau_academique" VARCHAR(20) NOT NULL,
    "niveau_academique_autre" VARCHAR(255),
    "intitule_diplome" TEXT NOT NULL,
    "annees_experience" VARCHAR(20) NOT NULL,
    "domaines_exercice" TEXT NOT NULL DEFAULT '',
    "projets_personnels" TEXT NOT NULL DEFAULT '',
    "lien_profil" TEXT NOT NULL DEFAULT '',
    "remarques" TEXT NOT NULL DEFAULT '',
    "final_choice" VARCHAR(50) NOT NULL DEFAULT '',

    CONSTRAINT "survey_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_subject_responses" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "response" VARCHAR(20) NOT NULL DEFAULT 'non',
    "condition_text" TEXT,

    CONSTRAINT "survey_subject_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_categories_slug_key" ON "survey_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "survey_submissions_email_key" ON "survey_submissions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "survey_subject_responses_submission_id_subject_id_key" ON "survey_subject_responses"("submission_id", "subject_id");

-- AddForeignKey
ALTER TABLE "survey_subjects" ADD CONSTRAINT "survey_subjects_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "survey_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_subject_responses" ADD CONSTRAINT "survey_subject_responses_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "survey_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_subject_responses" ADD CONSTRAINT "survey_subject_responses_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "survey_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
