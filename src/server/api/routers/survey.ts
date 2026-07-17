import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const LEVEL_ORDER = ["B1", "B2", "B3", "M1", "M2"];

export const surveyRouter = createTRPCRouter({
  getHub: publicProcedure.query(async ({ ctx }) => {
    const perimeters = await ctx.db.perimeter.findMany({
      select: { id: true, title: true, slug: true, color: true },
      orderBy: { title: "asc" },
    });
    return { perimeters };
  }),

  getConfig: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const perimeter = await ctx.db.perimeter.findUnique({
        where: { slug: input.slug },
      });
      if (!perimeter) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Perimeter not found" });
      }

      const promos = await ctx.db.promos.findMany({
        where: { perimeterId: perimeter.id },
        include: {
          promoModules: {
            include: { module: true },
          },
        },
      });

      const sortedPromos = [...promos].sort((a, b) => {
        const levelDiff = LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);
        if (levelDiff !== 0) return levelDiff;
        return a.specialty.localeCompare(b.specialty);
      });

      const categories = sortedPromos.map((promo, index) => ({
        id: promo.id,
        slug: promo.id,
        label: `${promo.level} - ${promo.specialty}`,
        level: promo.level.startsWith("M") ? "mastere" : "bachelor",
        year: Number(promo.level.slice(1)) || 1,
        specialization: promo.specialty,
        icon: promo.icon,
        sortOrder: index + 1,
        title: promo.surveyTitle ?? `${promo.level} - ${promo.specialty}`,
        introduction: promo.surveyIntroduction ?? "",
        subjects: promo.promoModules
          .slice()
          .sort((a, b) => a.module.name.localeCompare(b.module.name))
          .map((pm, subIndex) => ({
            id: pm.id,
            title: pm.module.name,
            volumeHoraire: pm.workload,
            periode: pm.module.periode ?? "",
            avecMentor: pm.module.avecMentor,
            contenu: pm.module.description ?? "",
            sortOrder: subIndex + 1,
          })),
      }));

      return {
        perimeter: { id: perimeter.id, title: perimeter.title, slug: perimeter.slug, color: perimeter.color },
        categories,
      };
    }),

  submit: publicProcedure
    .input(
      z.object({
        slug: z.string(),
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
      const perimeter = await ctx.db.perimeter.findUnique({ where: { slug: input.slug } });
      if (!perimeter) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Perimeter not found" });
      }

      const existing = await ctx.db.surveySubmission.findUnique({
        where: { perimeterId_email: { perimeterId: perimeter.id, email: input.email } },
        select: { id: true },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Cette adresse e-mail est deja associee a une reponse precedente. Veuillez utiliser une adresse differente ou contacter l'administrateur.",
          cause: { code: "EMAIL_DUPLICATE" },
        });
      }

      // Only keep answers that reference a PromoModules actually belonging to
      // this perimeter. This guards against stale identifiers coming from an
      // outdated client (e.g. cached localStorage after a module was removed or
      // the data was regenerated), which would otherwise violate the foreign
      // key constraint and reject the whole submission.
      const validPromoModules = await ctx.db.promoModules.findMany({
        where: { promo: { perimeterId: perimeter.id } },
        select: {
          id: true,
          module: { select: { name: true } },
          promo: { select: { level: true, specialty: true } },
        },
      });
      const validPromoModulesById = new Map(
        validPromoModules.map((pm) => [pm.id, pm]),
      );

      const responsesToCreate = input.subject_responses
        .filter(
          (r) =>
            r.response &&
            r.response !== "non" &&
            validPromoModulesById.has(r.subject_id),
        )
        .map((r) => {
          const pm = validPromoModulesById.get(r.subject_id)!;
          return {
            promoModulesId: r.subject_id,
            moduleLabelSnapshot:
              `${pm.promo.level} ${pm.promo.specialty} - ${pm.module.name}`.slice(
                0,
                255,
              ),
            response: r.response,
            conditionText: r.condition_text ?? null,
          };
        });

      const submission = await ctx.db.surveySubmission.create({
        data: {
          perimeterId: perimeter.id,
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
          responses: { create: responsesToCreate },
        },
      });

      return {
        id: submission.id,
        message: "Votre formulaire a ete soumis avec succes.",
      };
    }),
});
