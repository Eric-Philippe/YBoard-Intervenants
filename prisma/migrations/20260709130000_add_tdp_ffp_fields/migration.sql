-- AlterTable
ALTER TABLE "Modules" ADD COLUMN     "nombre_heure_tdp" INTEGER,
ADD COLUMN     "nombre_heure_ffp" INTEGER;

-- AlterTable
ALTER TABLE "ongoing" ADD COLUMN     "rateTDP" DECIMAL(5,2),
ADD COLUMN     "rateFFP" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "potential" ADD COLUMN     "rateTDP" DECIMAL(5,2),
ADD COLUMN     "rateFFP" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "selected" ADD COLUMN     "rateTDP" DECIMAL(5,2),
ADD COLUMN     "rateFFP" DECIMAL(5,2);
