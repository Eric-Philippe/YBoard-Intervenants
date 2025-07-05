import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const modulesRouter = createTRPCRouter({
  getCount: publicProcedure.query(async ({ ctx }) => {
    try {
      const count = await ctx.db.modules.count();
      return count;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to count modules",
      });
    }
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const modules = await ctx.db.modules.findMany({
        include: {
          promoModules: {
            include: {
              promo: true,
            },
          },
        },
      });
      return modules;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch modules",
      });
    }
  }),

  getByPromo: publicProcedure
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

  getAllWithRelations: publicProcedure.query(async ({ ctx }) => {
    try {
      const modules = await ctx.db.modules.findMany({
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
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch modules with relations",
      });
    }
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        promoId: z.string().optional(),
        workload: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { name, promoId, workload } = input;

        const newModule = await ctx.db.modules.create({
          data: { name },
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
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create module",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const updatedModule = await ctx.db.modules.update({
          where: { id: input.id },
          data: { name: input.name },
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

  delete: publicProcedure
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
