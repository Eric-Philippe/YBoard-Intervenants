import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { resolvePerimeterId } from "~/server/api/helpers/perimeter";
import { snapshotOrphanedSurveyResponses } from "~/server/api/helpers/surveyOrphan";
import { TRPCError } from "@trpc/server";

const perimeterInput = z.object({ perimeterId: z.string().optional() });

export const promosRouter = createTRPCRouter({
  getCount: protectedProcedure
    .input(perimeterInput.optional())
    .query(async ({ ctx, input }) => {
      try {
        const perimeterId = await resolvePerimeterId(ctx.db, ctx.userId, input?.perimeterId);
        return await ctx.db.promos.count({ where: { perimeterId } });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to count promos",
        });
      }
    }),

  getAll: protectedProcedure
    .input(perimeterInput.optional())
    .query(async ({ ctx, input }) => {
      try {
        const perimeterId = await resolvePerimeterId(ctx.db, ctx.userId, input?.perimeterId);
        const promos = await ctx.db.promos.findMany({
          where: { perimeterId },
          orderBy: [{ level: "asc" }, { specialty: "asc" }],
          include: {
            promoModules: {
              include: {
                module: true,
                selected: {
                  select: {
                    workload: true,
                  },
                },
              },
            },
          },
        });
        return promos;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch promos",
        });
      }
    }),

  getAllWithRelations: protectedProcedure
    .input(perimeterInput.optional())
    .query(async ({ ctx, input }) => {
      try {
        const perimeterId = await resolvePerimeterId(ctx.db, ctx.userId, input?.perimeterId);
        const promos = await ctx.db.promos.findMany({
          where: { perimeterId },
          orderBy: [{ level: "asc" }, { specialty: "asc" }],
          include: {
            promoModules: {
              include: {
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
            },
          },
        });
        return promos;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch promos with relations",
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const promo = await ctx.db.promos.findUnique({
          where: { id: input.id },
          include: {
            promoModules: {
              include: {
                module: true,
              },
            },
          },
        });

        if (!promo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Promo not found",
          });
        }

        return promo;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch promo",
        });
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        level: z.string().min(1),
        specialty: z.string().min(1),
        icon: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const perimeterId = await resolvePerimeterId(ctx.db, ctx.userId);
        const promo = await ctx.db.promos.create({
          data: { ...input, perimeterId },
        });
        return promo;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create promo",
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        level: z.string().min(1).optional(),
        specialty: z.string().min(1).optional(),
        icon: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updateData } = input;
        const promo = await ctx.db.promos.update({
          where: { id },
          data: updateData,
        });
        return promo;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update promo",
        });
      }
    }),

  migrateToPerimeter: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        targetPerimeterId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const promo = await ctx.db.promos.findUnique({
          where: { id: input.id },
          include: {
            promoModules: { include: { module: true } },
          },
        });

        if (!promo) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Promo introuvable" });
        }

        if (promo.perimeterId === input.targetPerimeterId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "La promo est déjà dans ce périmètre",
          });
        }

        const targetPerimeter = await ctx.db.perimeter.findUnique({
          where: { id: input.targetPerimeterId },
        });
        if (!targetPerimeter) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Périmètre cible introuvable",
          });
        }

        const moduleIds = promo.promoModules.map((pm) => pm.moduleId);

        // Mutualization only ever happens between promos of the same perimeter,
        // so any other PromoModules link on one of these modules necessarily
        // belongs to a promo left behind in the source perimeter.
        const conflictingLinks = moduleIds.length
          ? await ctx.db.promoModules.findMany({
              where: {
                moduleId: { in: moduleIds },
                promoId: { not: input.id },
              },
              include: { module: true, promo: true },
            })
          : [];

        if (conflictingLinks.length > 0) {
          const details = conflictingLinks
            .map(
              (link) =>
                `"${link.module.name}" (mutualisé avec ${link.promo.level} - ${link.promo.specialty})`,
            )
            .join(", ");
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Migration impossible : ${details}. Retirez la mutualisation de ces modules avant de migrer cette promo.`,
          });
        }

        await ctx.db.$transaction(async (prisma) => {
          if (moduleIds.length > 0) {
            await prisma.modules.updateMany({
              where: { id: { in: moduleIds } },
              data: { perimeterId: input.targetPerimeterId },
            });
          }
          await prisma.promos.update({
            where: { id: input.id },
            data: { perimeterId: input.targetPerimeterId },
          });
        });

        return {
          success: true,
          migratedModulesCount: moduleIds.length,
          targetPerimeterTitle: targetPerimeter.title,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error migrating promo:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to migrate promo",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // First, get the promo with all its related data to understand what will be deleted
        const promoToDelete = await ctx.db.promos.findUnique({
          where: { id: input.id },
          include: {
            promoModules: {
              include: {
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
            },
          },
        });

        if (!promoToDelete) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Promo not found",
          });
        }

        // Survey responses tied to any of this promo's module links are kept
        // (FK is ON DELETE SET NULL) but get a readable snapshot label first.
        await snapshotOrphanedSurveyResponses(
          ctx.db,
          promoToDelete.promoModules.map((pm) => pm.id),
        );

        // Use a transaction to ensure all related data is deleted properly
        await ctx.db.$transaction(async (prisma) => {
          // Delete all ongoing relations for this promo's modules
          for (const promoModule of promoToDelete.promoModules) {
            await prisma.ongoing.deleteMany({
              where: { promoModulesId: promoModule.id },
            });

            await prisma.potential.deleteMany({
              where: { promoModulesId: promoModule.id },
            });

            await prisma.selected.deleteMany({
              where: { promoModulesId: promoModule.id },
            });
          }

          // Delete all PromoModules for this promo
          await prisma.promoModules.deleteMany({
            where: { promoId: input.id },
          });

          // Finally, delete the promo itself
          await prisma.promos.delete({
            where: { id: input.id },
          });
        });

        return {
          success: true,
          deletedData: {
            promo: `${promoToDelete.level} - ${promoToDelete.specialty}`,
            promoModulesCount: promoToDelete.promoModules.length,
            relationsCount: promoToDelete.promoModules.reduce(
              (total, pm) =>
                total +
                pm.ongoing.length +
                pm.potential.length +
                pm.selected.length,
              0,
            ),
          },
        };
      } catch (error) {
        console.error("Error deleting promo:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete promo and associated data",
        });
      }
    }),
});
