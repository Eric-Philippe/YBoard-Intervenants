import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const promoModulesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const promoModules = await ctx.db.promoModules.findMany({
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
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch promo-modules",
      });
    }
  }),

  getById: publicProcedure
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

  create: publicProcedure
    .input(
      z.object({
        moduleId: z.string(),
        promoId: z.string(),
        workload: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
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
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create promo-module",
        });
      }
    }),

  update: publicProcedure
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

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
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

  getCartesianData: publicProcedure.query(async ({ ctx }) => {
    try {
      const promoModules = await ctx.db.promoModules.findMany({
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
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch cartesian data",
      });
    }
  }),
});
