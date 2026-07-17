-- DropForeignKey
ALTER TABLE "survey_responses" DROP CONSTRAINT "survey_responses_promo_modules_id_fkey";

-- AlterTable
ALTER TABLE "survey_responses" ADD COLUMN     "module_label_snapshot" VARCHAR(255),
ALTER COLUMN "promo_modules_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PromoModules_Id_Module_Id_Promo_key" ON "PromoModules"("Id_Module", "Id_Promo");

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_promo_modules_id_fkey" FOREIGN KEY ("promo_modules_id") REFERENCES "PromoModules"("Id_PromoModules") ON DELETE SET NULL ON UPDATE CASCADE;

