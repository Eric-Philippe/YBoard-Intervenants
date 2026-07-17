import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { resolvePerimeterId } from "~/server/api/helpers/perimeter";
import { snapshotOrphanedSurveyResponses } from "~/server/api/helpers/surveyOrphan";
import { TRPCError } from "@trpc/server";

const MAX_PROMOS_PER_MODULE = 3;

const perimeterInput = z.object({ perimeterId: z.string().optional() });

export const promoModulesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(perimeterInput.optional())
    .query(async ({ ctx, input }) => {
      try {
        const perimeterId = await resolvePerimeterId(
          ctx.db,
          ctx.userId,
          input?.perimeterId,
        );
        const promoModules = await ctx.db.promoModules.findMany({
          where: { promo: { perimeterId } },
          include: {
            promo: true,
            module: true,
            ongoing: {
              include: {
                teacher: true,
              },
            },
            potential: {
              include: {
                teacher: true,
              },
            },
            selected: {
              include: {
                teacher: true,
              },
            },
          },
          orderBy: [
            { promo: { level: "asc" } },
            { promo: { specialty: "asc" } },
            { module: { name: "asc" } },
          ],
        });
        return promoModules;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch promo-modules",
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const promoModule = await ctx.db.promoModules.findUnique({
          where: { id: input.id },
          include: {
            promo: true,
            module: true,
            ongoing: {
              include: {
                teacher: true,
              },
            },
            potential: {
              include: {
                teacher: true,
              },
            },
            selected: {
              include: {
                teacher: true,
              },
            },
          },
        });

        if (!promoModule) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "PromoModule not found",
          });
        }

        return promoModule;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch promo-module",
        });
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        moduleId: z.string(),
        promoId: z.string(),
        workload: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const [promo, mod, existingLinks] = await Promise.all([
          ctx.db.promos.findUnique({ where: { id: input.promoId } }),
          ctx.db.modules.findUnique({ where: { id: input.moduleId } }),
          ctx.db.promoModules.findMany({ where: { moduleId: input.moduleId } }),
        ]);
        if (!promo || !mod || promo.perimeterId !== mod.perimeterId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "La promo et le module doivent appartenir au même périmètre",
          });
        }
        if (existingLinks.some((link) => link.promoId === input.promoId)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ce module est déja rattaché à cette promo",
          });
        }
        if (existingLinks.length >= MAX_PROMOS_PER_MODULE) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Un module ne peut être mutualisé entre plus de ${MAX_PROMOS_PER_MODULE} promos`,
          });
        }

        const promoModule = await ctx.db.promoModules.create({
          data: input,
          include: {
            promo: true,
            module: true,
            ongoing: {
              include: {
                teacher: true,
              },
            },
            potential: {
              include: {
                teacher: true,
              },
            },
            selected: {
              include: {
                teacher: true,
              },
            },
          },
        });

        return promoModule;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create promo-module",
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        moduleId: z.string().optional(),
        promoId: z.string().optional(),
        workload: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updateData } = input;
        const promoModule = await ctx.db.promoModules.update({
          where: { id },
          data: updateData,
          include: {
            promo: true,
            module: true,
            ongoing: {
              include: {
                teacher: true,
              },
            },
            potential: {
              include: {
                teacher: true,
              },
            },
            selected: {
              include: {
                teacher: true,
              },
            },
          },
        });

        return promoModule;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update promo-module",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Any survey responses tied to this link are preserved (FK is ON DELETE
        // SET NULL), but we snapshot a readable label first so they don't show
        // up blank once orphaned.
        await snapshotOrphanedSurveyResponses(ctx.db, [input.id]);

        await ctx.db.promoModules.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete promo-module",
        });
      }
    }),

  getCartesianData: protectedProcedure
    .input(perimeterInput.optional())
    .query(async ({ ctx, input }) => {
      try {
        const perimeterId = await resolvePerimeterId(
          ctx.db,
          ctx.userId,
          input?.perimeterId,
        );
        const promoModules = await ctx.db.promoModules.findMany({
          where: { promo: { perimeterId } },
          include: {
            promo: true,
            module: true,
            ongoing: {
              include: {
                teacher: true,
              },
            },
            potential: {
              include: {
                teacher: true,
              },
            },
            selected: {
              include: {
                teacher: true,
              },
            },
          },
          orderBy: [
            { promo: { level: "asc" } },
            { promo: { specialty: "asc" } },
            { module: { name: "asc" } },
          ],
        });

        // Transform data to match frontend CartesianData interface
        const cartesianData = promoModules.map((promoModule) => ({
          promoModule: {
            id: promoModule.id,
            moduleId: promoModule.moduleId,
            promoId: promoModule.promoId,
            workload: promoModule.workload,
            module: promoModule.module,
            promo: promoModule.promo,
          },
          ongoing: promoModule.ongoing,
          potential: promoModule.potential,
          selected: promoModule.selected,
        }));

        return cartesianData;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch cartesian data",
        });
      }
    }),
});
