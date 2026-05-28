import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const surveyRouter = createTRPCRouter({
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.surveyCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        subjects: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return { categories };
  }),

  submit: publicProcedure
    .input(
      z.object({
        nom: z.string().min(1),
        prenom: z.string().min(1),
        email: z.string().email(),
        telephone: z.string().default(""),
        niveau_academique: z.string().min(1),
        niveau_academique_autre: z.string().nullable().optional(),
        intitule_diplome: z.string().min(1),
        annees_experience: z.string().min(1),
        domaines_exercice: z.string().default(""),
        projets_personnels: z.string().default(""),
        lien_profil: z.string().default(""),
        remarques: z.string().default(""),
        final_choice: z.string().default(""),
        origin: z.string().nullable().optional(),
        subject_responses: z
          .array(
            z.object({
              subject_id: z.string(),
              response: z.string(),
              condition_text: z.string().nullable().optional(),
            }),
          )
          .default([]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.db.surveySubmission.findUnique({
        where: { email: input.email },
        select: { id: true },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Cette adresse e-mail est déjà associée à une réponse précédente. Veuillez utiliser une adresse différente ou contacter l'administrateur.",
          cause: { code: "EMAIL_DUPLICATE" },
        });
      }

      const submission = await ctx.db.surveySubmission.create({
        data: {
          nom: input.nom,
          prenom: input.prenom,
          email: input.email,
          telephone: input.telephone,
          niveauAcademique: input.niveau_academique,
          niveauAcademiqueAutre: input.niveau_academique_autre ?? null,
          intituleDiplome: input.intitule_diplome,
          anneesExperience: input.annees_experience,
          domainesExercice: input.domaines_exercice,
          projetsPersonnels: input.projets_personnels,
          lienProfil: input.lien_profil,
          remarques: input.remarques,
          finalChoice: input.final_choice,
          origin: input.origin ?? null,
          subjectResponses: {
            create: input.subject_responses
              .filter((r) => r.response && r.response !== "non")
              .map((r) => ({
                subjectId: r.subject_id,
                response: r.response,
                conditionText: r.condition_text ?? null,
              })),
          },
        },
      });

      return {
        id: submission.id,
        message: "Votre formulaire a été soumis avec succès.",
      };
    }),
});
