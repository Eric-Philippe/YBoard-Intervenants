import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { resolvePerimeterId } from "~/server/api/helpers/perimeter";
import { snapshotOrphanedSurveyResponses } from "~/server/api/helpers/surveyOrphan";
import { TRPCError } from "@trpc/server";

const perimeterInput = z.object({ perimeterId: z.string().optional() });

export const modulesRouter = createTRPCRouter({
  getCount: protectedProcedure
    .input(perimeterInput.optional())
    .query(async ({ ctx, input }) => {
      try {
        const perimeterId = await resolvePerimeterId(ctx.db, ctx.userId, input?.perimeterId);
        return await ctx.db.modules.count({ where: { perimeterId } });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to count modules",
        });
      }
    }),

  getAll: protectedProcedure
    .input(perimeterInput.optional())
    .query(async ({ ctx, input }) => {
      try {
        const perimeterId = await resolvePerimeterId(ctx.db, ctx.userId, input?.perimeterId);
        const modules = await ctx.db.modules.findMany({
          where: { perimeterId },
          include: {
            promoModules: {
              include: {
                promo: true,
              },
            },
          },
        });
        return modules;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch modules",
        });
      }
    }),

  getByPromo: protectedProcedure
    .input(z.object({ promoId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const promoModules = await ctx.db.promoModules.findMany({
          where: { promoId: input.promoId },
          include: {
            module: true,
            promo: true,
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
          orderBy: { module: { name: "asc" } },
        });
        return promoModules;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch modules for promo",
        });
      }
    }),

  getAllWithRelations: protectedProcedure
    .input(perimeterInput.optional())
    .query(async ({ ctx, input }) => {
      try {
        const perimeterId = await resolvePerimeterId(ctx.db, ctx.userId, input?.perimeterId);
        const modules = await ctx.db.modules.findMany({
          where: { perimeterId },
          include: {
            promoModules: {
              include: {
                promo: true,
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
            },
          },
          orderBy: { name: "asc" },
        });
        return modules;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch modules with relations",
        });
      }
    }),

  getMutualization: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const module_ = await ctx.db.modules.findUnique({
          where: { id: input.moduleId },
        });
        if (!module_) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Module not found" });
        }
        const links = await ctx.db.promoModules.findMany({
          where: { moduleId: input.moduleId },
          include: { promo: true },
          orderBy: { promo: { level: "asc" } },
        });
        return { module: module_, links };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch module mutualization",
        });
      }
    }),

  getMutualizationCounts: protectedProcedure
    .input(perimeterInput.optional())
    .query(async ({ ctx, input }) => {
      try {
        const perimeterId = await resolvePerimeterId(ctx.db, ctx.userId, input?.perimeterId);
        const links = await ctx.db.promoModules.findMany({
          where: { module: { perimeterId } },
          select: { moduleId: true },
        });
        const counts: Record<string, number> = {};
        for (const link of links) {
          counts[link.moduleId] = (counts[link.moduleId] ?? 0) + 1;
        }
        return counts;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch module mutualization counts",
        });
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        periode: z.string().optional(),
        avecMentor: z.boolean().optional(),
        nombreHeureTDP: z.number().int().positive().optional(),
        nombreHeureFFP: z.number().int().positive().optional(),
        promoId: z.string().optional(),
        workload: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const {
          name,
          description,
          periode,
          avecMentor,
          nombreHeureTDP,
          nombreHeureFFP,
          promoId,
          workload,
        } = input;
        const perimeterId = await resolvePerimeterId(ctx.db, ctx.userId);

        if (promoId) {
          const promo = await ctx.db.promos.findUnique({ where: { id: promoId } });
          if (!promo || promo.perimeterId !== perimeterId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "La promo choisie n'appartient pas a ce perimetre",
            });
          }
        }

        const newModule = await ctx.db.modules.create({
          data: {
            name,
            description,
            periode,
            avecMentor,
            nombreHeureTDP,
            nombreHeureFFP,
            perimeterId,
          },
        });

        if (promoId && workload) {
          await ctx.db.promoModules.create({
            data: {
              moduleId: newModule.id,
              promoId,
              workload,
            },
          });
        }

        return newModule;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create module",
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        periode: z.string().optional(),
        avecMentor: z.boolean().optional(),
        nombreHeureTDP: z.number().int().positive().optional(),
        nombreHeureFFP: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...data } = input;
        const updatedModule = await ctx.db.modules.update({
          where: { id },
          data,
          include: {
            promoModules: {
              include: {
                promo: true,
              },
            },
          },
        });

        return updatedModule;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update module",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // First, count related data for reporting
        const promoModules = await ctx.db.promoModules.findMany({
          where: { moduleId: input.id },
          include: {
            ongoing: true,
            potential: true,
            selected: true,
          },
        });

        const moduleData = await ctx.db.modules.findUnique({
          where: { id: input.id },
        });

        if (!moduleData) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Module not found",
          });
        }

        // Count relations
        let relationsCount = 0;
        promoModules.forEach((pm) => {
          relationsCount +=
            pm.ongoing.length + pm.potential.length + pm.selected.length;
        });

        // Survey responses tied to any of this module's promo links are kept
        // (FK is ON DELETE SET NULL) but get a readable snapshot label first.
        await snapshotOrphanedSurveyResponses(
          ctx.db,
          promoModules.map((pm) => pm.id),
        );

        // Delete the module (cascade will handle the rest)
        await ctx.db.modules.delete({
          where: { id: input.id },
        });

        return {
          success: true,
          deletedData: {
            module: moduleData.name,
            promoModulesCount: promoModules.length,
            relationsCount,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete module",
        });
      }
    }),
});
