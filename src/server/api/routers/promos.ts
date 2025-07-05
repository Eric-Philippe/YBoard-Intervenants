import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const promosRouter = createTRPCRouter({
  getCount: publicProcedure.query(async ({ ctx }) => {
    try {
      const count = await ctx.db.promos.count();
      return count;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to count promos",
      });
    }
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const promos = await ctx.db.promos.findMany({
        include: {
          promoModules: {
            include: {
              module: true,
            },
          },
        },
      });
      return promos;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch promos",
      });
    }
  }),

  getAllWithRelations: publicProcedure.query(async ({ ctx }) => {
    try {
      const promos = await ctx.db.promos.findMany({
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
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch promos with relations",
      });
    }
  }),

  getById: publicProcedure
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

  create: publicProcedure
    .input(
      z.object({
        level: z.string().min(1),
        specialty: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const promo = await ctx.db.promos.create({
          data: input,
        });
        return promo;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create promo",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        level: z.string().min(1).optional(),
        specialty: z.string().min(1).optional(),
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

  delete: publicProcedure
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
