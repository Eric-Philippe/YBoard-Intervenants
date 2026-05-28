import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const surveyAdminRouter = createTRPCRouter({
  listSubmissions: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().default(20),
        search: z.string().optional(),
        categorySlug: z.string().optional(),
        response: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, search, categorySlug, response } = input;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (search) {
        where.OR = [
          { nom: { contains: search, mode: "insensitive" } },
          { prenom: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (categorySlug) {
        where.subjectResponses = {
          some: {
            subject: {
              category: { slug: categorySlug },
            },
          },
        };
      }

      if (response) {
        where.subjectResponses = {
          ...((where.subjectResponses as object) ?? {}),
          some: {
            ...((where.subjectResponses as { some?: object })?.some ?? {}),
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
          subjectResponses: {
            include: {
              subject: {
                include: { category: true },
              },
            },
            orderBy: [
              { subject: { category: { sortOrder: "asc" } } },
              { subject: { sortOrder: "asc" } },
            ],
          },
        },
      });

      if (!submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Réponse introuvable",
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
          message: "Réponse introuvable",
        });
      }
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [total, origins, finalChoices] = await Promise.all([
      ctx.db.surveySubmission.count(),
      ctx.db.surveySubmission.groupBy({
        by: ["origin"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      ctx.db.surveySubmission.groupBy({
        by: ["finalChoice"],
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

  getSubjectStats: protectedProcedure.query(async ({ ctx }) => {
    const responses = await ctx.db.surveySubjectResponse.groupBy({
      by: ["subjectId", "response"],
      _count: { id: true },
      where: { response: { in: ["oui", "peut_etre"] } },
    });

    const map = new Map<string, { oui: number; peut_etre: number }>();
    for (const r of responses) {
      const entry = map.get(r.subjectId) ?? { oui: 0, peut_etre: 0 };
      if (r.response === "oui") entry.oui = r._count.id;
      if (r.response === "peut_etre") entry.peut_etre = r._count.id;
      map.set(r.subjectId, entry);
    }

    return Array.from(map.entries()).map(([subject_id, counts]) => ({
      subject_id,
      ...counts,
    }));
  }),

  getSubjectResponses: protectedProcedure
    .input(z.object({ subjectId: z.string() }))
    .query(async ({ input, ctx }) => {
      const subject = await ctx.db.surveySubject.findUnique({
        where: { id: input.subjectId },
        include: { category: true },
      });

      if (!subject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Matière introuvable",
        });
      }

      const responses = await ctx.db.surveySubjectResponse.findMany({
        where: {
          subjectId: input.subjectId,
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
        subject_id: subject.id,
        subject_title: subject.title,
        category_label: subject.category.label,
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
      return ctx.db.surveySubmissionTeacher.upsert({
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
    }),

  createAndLinkTeacher: protectedProcedure
    .input(
      z.object({
        submissionId: z.string(),
        firstname: z.string().min(1),
        lastname: z.string().min(1),
        status: z.string().optional(),
        diploma: z.string().optional(),
        comments: z.string().optional(),
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
      return teacher;
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
