import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

/**
 * When a survey respondent is linked to a teacher, they should automatically
 * show up as "potential" on every module they answered "oui" or "peut_etre"
 * to. Orphaned responses (module removed/mutualization undone since the
 * submission) are skipped since there's nothing left to link them to.
 */
async function linkPositiveResponsesAsPotential(
  db: PrismaClient,
  submissionId: string,
  teacherId: string,
): Promise<number> {
  const responses = await db.surveyResponse.findMany({
    where: {
      submissionId,
      response: { in: ["oui", "peut_etre"] },
      promoModulesId: { not: null },
    },
    include: { promoModules: true },
  });

  let count = 0;
  for (const response of responses) {
    if (!response.promoModules) continue;
    await db.potential.upsert({
      where: {
        teacherId_promoModulesId: {
          teacherId,
          promoModulesId: response.promoModules.id,
        },
      },
      create: {
        teacherId,
        promoModulesId: response.promoModules.id,
        workload: response.promoModules.workload,
      },
      update: {},
    });
    count++;
  }
  return count;
}

export const surveyAdminRouter = createTRPCRouter({
  listSubmissions: protectedProcedure
    .input(
      z.object({
        perimeterId: z.string(),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().default(20),
        search: z.string().optional(),
        promoId: z.string().optional(),
        response: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { perimeterId, page, limit, search, promoId, response } = input;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = { perimeterId };

      if (search) {
        where.OR = [
          { nom: { contains: search, mode: "insensitive" } },
          { prenom: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (promoId) {
        where.responses = {
          some: {
            promoModules: { promoId },
          },
        };
      }

      if (response) {
        where.responses = {
          ...((where.responses as object) ?? {}),
          some: {
            ...((where.responses as { some?: object })?.some ?? {}),
            response,
          },
        };
      }

      const [submissions, total] = await Promise.all([
        ctx.db.surveySubmission.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            createdAt: true,
            origin: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            niveauAcademique: true,
            niveauAcademiqueAutre: true,
            intituleDiplome: true,
            anneesExperience: true,
            domainesExercice: true,
            projetsPersonnels: true,
            lienProfil: true,
            remarques: true,
            finalChoice: true,
          },
        }),
        ctx.db.surveySubmission.count({ where }),
      ]);

      return { submissions, total, page, limit };
    }),

  getSubmission: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const submission = await ctx.db.surveySubmission.findUnique({
        where: { id: input.id },
        include: {
          responses: {
            include: {
              promoModules: {
                include: { module: true, promo: true },
              },
            },
          },
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reponse introuvable",
        });
      }

      return submission;
    }),

  deleteSubmission: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.surveySubmission.delete({ where: { id: input.id } });
        return { success: true };
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reponse introuvable",
        });
      }
    }),

  getStats: protectedProcedure
    .input(z.object({ perimeterId: z.string() }))
    .query(async ({ input, ctx }) => {
      const where = { perimeterId: input.perimeterId };
      const [total, origins, finalChoices] = await Promise.all([
        ctx.db.surveySubmission.count({ where }),
        ctx.db.surveySubmission.groupBy({
          by: ["origin"],
          where,
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        }),
        ctx.db.surveySubmission.groupBy({
          by: ["finalChoice"],
          where,
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        }),
      ]);

      return {
        totalSubmissions: total,
        origins: origins.map((o) => ({
          origin: o.origin ?? "Direct",
          count: o._count.id,
        })),
        finalChoices: finalChoices.map((f) => ({
          choice: f.finalChoice,
          count: f._count.id,
        })),
      };
    }),

  getSubjectStats: protectedProcedure
    .input(z.object({ perimeterId: z.string() }))
    .query(async ({ input, ctx }) => {
      const responses = await ctx.db.surveyResponse.groupBy({
        by: ["promoModulesId", "response"],
        _count: { id: true },
        where: {
          response: { in: ["oui", "peut_etre"] },
          submission: { perimeterId: input.perimeterId },
          promoModulesId: { not: null },
        },
      });

      const map = new Map<string, { oui: number; peut_etre: number }>();
      for (const r of responses) {
        if (!r.promoModulesId) continue;
        const entry = map.get(r.promoModulesId) ?? { oui: 0, peut_etre: 0 };
        if (r.response === "oui") entry.oui = r._count.id;
        if (r.response === "peut_etre") entry.peut_etre = r._count.id;
        map.set(r.promoModulesId, entry);
      }

      return Array.from(map.entries()).map(([subject_id, counts]) => ({
        subject_id,
        ...counts,
      }));
    }),

  getSubjectResponses: protectedProcedure
    .input(z.object({ promoModulesId: z.string() }))
    .query(async ({ input, ctx }) => {
      const promoModule = await ctx.db.promoModules.findUnique({
        where: { id: input.promoModulesId },
        include: { module: true, promo: true },
      });

      if (!promoModule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Matiere introuvable",
        });
      }

      const responses = await ctx.db.surveyResponse.findMany({
        where: {
          promoModulesId: input.promoModulesId,
          response: { in: ["oui", "peut_etre"] },
        },
        include: {
          submission: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              telephone: true,
              intituleDiplome: true,
              niveauAcademique: true,
            },
          },
        },
        orderBy: [{ response: "asc" }, { submission: { nom: "asc" } }],
      });

      return {
        subject_id: promoModule.id,
        subject_title: promoModule.module.name,
        category_label: `${promoModule.promo.level} - ${promoModule.promo.specialty}`,
        responders: responses.map((r) => ({
          submission_id: r.submission.id,
          nom: r.submission.nom,
          prenom: r.submission.prenom,
          email: r.submission.email,
          telephone: r.submission.telephone,
          intituleDiplome: r.submission.intituleDiplome,
          niveauAcademique: r.submission.niveauAcademique,
          response: r.response,
          condition_text: r.conditionText,
        })),
      };
    }),

  // ── Teacher linking ────────────────────────────────────────────────────────

  getSubmissionTeacherLinks: protectedProcedure
    .input(z.object({ submissionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const links = await ctx.db.surveySubmissionTeacher.findMany({
        where: { submissionId: input.submissionId },
        orderBy: { linkedAt: "asc" },
      });
      if (links.length === 0) return [];
      const teachers = await ctx.db.teacher.findMany({
        where: { id: { in: links.map((l) => l.teacherId) } },
      });
      return links.map((link) => ({
        linkId: link.id,
        linkedAt: link.linkedAt,
        teacher: teachers.find((t) => t.id === link.teacherId) ?? null,
      }));
    }),

  linkToExistingTeacher: protectedProcedure
    .input(z.object({ submissionId: z.string(), teacherId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const link = await ctx.db.surveySubmissionTeacher.upsert({
        where: {
          submissionId_teacherId: {
            submissionId: input.submissionId,
            teacherId: input.teacherId,
          },
        },
        create: {
          submissionId: input.submissionId,
          teacherId: input.teacherId,
        },
        update: {},
      });
      const potentialCount = await linkPositiveResponsesAsPotential(
        ctx.db,
        input.submissionId,
        input.teacherId,
      );
      return { ...link, potentialCount };
    }),

  createAndLinkTeacher: protectedProcedure
    .input(
      z.object({
        submissionId: z.string(),
        firstname: z.string().min(1),
        lastname: z.string().min(1),
        status: z.string().optional(),
        diploma: z.string().optional(),
        rate: z.number().optional(),
        email_perso: z.string().optional(),
        email_ynov: z.string().optional(),
        phone_number: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { submissionId, ...teacherData } = input;
      const teacher = await ctx.db.teacher.create({ data: teacherData });
      await ctx.db.surveySubmissionTeacher.create({
        data: { submissionId, teacherId: teacher.id },
      });
      const potentialCount = await linkPositiveResponsesAsPotential(
        ctx.db,
        submissionId,
        teacher.id,
      );
      return { ...teacher, potentialCount };
    }),

  unlinkTeacher: protectedProcedure
    .input(z.object({ submissionId: z.string(), teacherId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.surveySubmissionTeacher.delete({
        where: {
          submissionId_teacherId: {
            submissionId: input.submissionId,
            teacherId: input.teacherId,
          },
        },
      });
      return { success: true };
    }),

  assignTeacherToModule: protectedProcedure
    .input(z.object({ teacherId: z.string(), promoModuleId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const pm = await ctx.db.promoModules.findUnique({
        where: { id: input.promoModuleId },
      });
      if (!pm)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Module introuvable",
        });
      return ctx.db.potential.upsert({
        where: {
          teacherId_promoModulesId: {
            teacherId: input.teacherId,
            promoModulesId: input.promoModuleId,
          },
        },
        create: {
          teacherId: input.teacherId,
          promoModulesId: input.promoModuleId,
          workload: pm.workload,
        },
        update: {},
      });
    }),
});
