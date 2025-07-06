-- CreateTable
CREATE TABLE "Promos" (
    "Id_Promo" TEXT NOT NULL,
    "level" VARCHAR(50) NOT NULL,
    "specialty" VARCHAR(50) NOT NULL,

    CONSTRAINT "Promos_pkey" PRIMARY KEY ("Id_Promo")
);

-- CreateTable
CREATE TABLE "Modules" (
    "Id_Module" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Modules_pkey" PRIMARY KEY ("Id_Module")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "Id_Teacher" TEXT NOT NULL,
    "lastname" VARCHAR(50) NOT NULL,
    "firstname" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50),
    "diploma" VARCHAR(50),
    "comments" TEXT,
    "rate" DECIMAL(5,2),
    "email_perso" VARCHAR(50),
    "email_ynov" VARCHAR(50),
    "phone_number" VARCHAR(10),

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("Id_Teacher")
);

-- CreateTable
CREATE TABLE "PromoModules" (
    "Id_PromoModules" TEXT NOT NULL,
    "Id_Module" TEXT NOT NULL,
    "Id_Promo" TEXT NOT NULL,
    "workload" INTEGER NOT NULL,

    CONSTRAINT "PromoModules_pkey" PRIMARY KEY ("Id_PromoModules")
);

-- CreateTable
CREATE TABLE "ongoing" (
    "Id_Teacher" TEXT NOT NULL,
    "Id_PromoModules" TEXT NOT NULL,
    "workload" INTEGER NOT NULL,
    "rate" DECIMAL(5,2),

    CONSTRAINT "ongoing_pkey" PRIMARY KEY ("Id_Teacher","Id_PromoModules")
);

-- CreateTable
CREATE TABLE "potential" (
    "Id_Teacher" TEXT NOT NULL,
    "Id_PromoModules" TEXT NOT NULL,
    "workload" INTEGER NOT NULL,
    "rate" DECIMAL(5,2),
    "interview_date" DATE,
    "interview_comments" TEXT,
    "decision" BOOLEAN,

    CONSTRAINT "potential_pkey" PRIMARY KEY ("Id_Teacher","Id_PromoModules")
);

-- CreateTable
CREATE TABLE "selected" (
    "Id_Teacher" TEXT NOT NULL,
    "Id_PromoModules" TEXT NOT NULL,
    "workload" INTEGER NOT NULL,
    "rate" DECIMAL(5,2),

    CONSTRAINT "selected_pkey" PRIMARY KEY ("Id_Teacher","Id_PromoModules")
);

-- CreateTable
CREATE TABLE "Users" (
    "Id_Users" TEXT NOT NULL,
    "firstname" VARCHAR(50) NOT NULL,
    "lastname" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255),
    "last_connected" TIMESTAMP(6),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("Id_Users")
);

-- AddForeignKey
ALTER TABLE "PromoModules" ADD CONSTRAINT "PromoModules_Id_Module_fkey" FOREIGN KEY ("Id_Module") REFERENCES "Modules"("Id_Module") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoModules" ADD CONSTRAINT "PromoModules_Id_Promo_fkey" FOREIGN KEY ("Id_Promo") REFERENCES "Promos"("Id_Promo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ongoing" ADD CONSTRAINT "ongoing_Id_Teacher_fkey" FOREIGN KEY ("Id_Teacher") REFERENCES "Teacher"("Id_Teacher") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ongoing" ADD CONSTRAINT "ongoing_Id_PromoModules_fkey" FOREIGN KEY ("Id_PromoModules") REFERENCES "PromoModules"("Id_PromoModules") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "potential" ADD CONSTRAINT "potential_Id_Teacher_fkey" FOREIGN KEY ("Id_Teacher") REFERENCES "Teacher"("Id_Teacher") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "potential" ADD CONSTRAINT "potential_Id_PromoModules_fkey" FOREIGN KEY ("Id_PromoModules") REFERENCES "PromoModules"("Id_PromoModules") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selected" ADD CONSTRAINT "selected_Id_Teacher_fkey" FOREIGN KEY ("Id_Teacher") REFERENCES "Teacher"("Id_Teacher") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selected" ADD CONSTRAINT "selected_Id_PromoModules_fkey" FOREIGN KEY ("Id_PromoModules") REFERENCES "PromoModules"("Id_PromoModules") ON DELETE CASCADE ON UPDATE CASCADE;
