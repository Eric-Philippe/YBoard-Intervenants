import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const relationsRouter = createTRPCRouter({
  // Ongoing relations
  createOngoing: publicProcedure
    .input(
      z.object({
        teacherId: z.string(),
        promoModulesId: z.string(),
        workload: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.db.ongoing.create({
          data: input,
          include: {
            teacher: true,
            promoModules: {
              include: {
                promo: true,
                module: true,
              },
            },
          },
        });

        return result;
      } catch (error) {
        console.error("Error creating ongoing relation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create ongoing relation",
        });
      }
    }),

  updateOngoing: publicProcedure
    .input(
      z.object({
        teacherId: z.string(),
        promoModulesId: z.string(),
        workload: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { teacherId, promoModulesId, workload } = input;
        const result = await ctx.db.ongoing.update({
          where: {
            teacherId_promoModulesId: { teacherId, promoModulesId },
          },
          data: { workload },
          include: {
            teacher: true,
            promoModules: {
              include: {
                promo: true,
                module: true,
              },
            },
          },
        });

        return result;
      } catch (error) {
        console.error("Error updating ongoing relation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update ongoing relation",
        });
      }
    }),

  deleteOngoing: publicProcedure
    .input(
      z.object({
        teacherId: z.string(),
        promoModulesId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { teacherId, promoModulesId } = input;
        await ctx.db.ongoing.delete({
          where: {
            teacherId_promoModulesId: { teacherId, promoModulesId },
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Error deleting ongoing relation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete ongoing relation",
        });
      }
    }),

  // Potential relations
  createPotential: publicProcedure
    .input(
      z.object({
        teacherId: z.string(),
        promoModulesId: z.string(),
        workload: z.number().int().positive(),
        interview_date: z.date().optional(),
        interview_comments: z.string().optional(),
        decision: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.db.potential.create({
          data: input,
          include: {
            teacher: true,
            promoModules: {
              include: {
                promo: true,
                module: true,
              },
            },
          },
        });

        return result;
      } catch (error) {
        console.error("Error creating potential relation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create potential relation",
        });
      }
    }),

  updatePotential: publicProcedure
    .input(
      z.object({
        teacherId: z.string(),
        promoModulesId: z.string(),
        workload: z.number().int().positive().optional(),
        interview_date: z.date().optional(),
        interview_comments: z.string().optional(),
        decision: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { teacherId, promoModulesId, ...updateData } = input;
        const result = await ctx.db.potential.update({
          where: {
            teacherId_promoModulesId: { teacherId, promoModulesId },
          },
          data: updateData,
          include: {
            teacher: true,
            promoModules: {
              include: {
                promo: true,
                module: true,
              },
            },
          },
        });

        return result;
      } catch (error) {
        console.error("Error updating potential relation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update potential relation",
        });
      }
    }),

  deletePotential: publicProcedure
    .input(
      z.object({
        teacherId: z.string(),
        promoModulesId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { teacherId, promoModulesId } = input;
        await ctx.db.potential.delete({
          where: {
            teacherId_promoModulesId: { teacherId, promoModulesId },
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Error deleting potential relation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete potential relation",
        });
      }
    }),

  // Selected relations
  createSelected: publicProcedure
    .input(
      z.object({
        teacherId: z.string(),
        promoModulesId: z.string(),
        workload: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.db.selected.create({
          data: input,
          include: {
            teacher: true,
            promoModules: {
              include: {
                promo: true,
                module: true,
              },
            },
          },
        });

        return result;
      } catch (error) {
        console.error("Error creating selected relation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create selected relation",
        });
      }
    }),

  updateSelected: publicProcedure
    .input(
      z.object({
        teacherId: z.string(),
        promoModulesId: z.string(),
        workload: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { teacherId, promoModulesId, workload } = input;
        const result = await ctx.db.selected.update({
          where: {
            teacherId_promoModulesId: { teacherId, promoModulesId },
          },
          data: { workload },
          include: {
            teacher: true,
            promoModules: {
              include: {
                promo: true,
                module: true,
              },
            },
          },
        });

        return result;
      } catch (error) {
        console.error("Error updating selected relation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update selected relation",
        });
      }
    }),

  deleteSelected: publicProcedure
    .input(
      z.object({
        teacherId: z.string(),
        promoModulesId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { teacherId, promoModulesId } = input;
        await ctx.db.selected.delete({
          where: {
            teacherId_promoModulesId: { teacherId, promoModulesId },
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Error deleting selected relation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete selected relation",
        });
      }
    }),
});
