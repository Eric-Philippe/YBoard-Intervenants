import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Schema for rate that accepts both string and number and converts to number
const rateSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  })
  .refine((val) => val === undefined || val > 0, {
    message: "Rate must be positive",
  })
  .optional();

// No rate at all is valid (falls back to the teacher's default rate), as is a
// standard rate, or a complete TDP/FFP pair. Only a half-filled TDP/FFP pair
// (one set without the other) is rejected.
const withRateRefine = <
  T extends {
    rate: typeof rateSchema;
    rateTDP: typeof rateSchema;
    rateFFP: typeof rateSchema;
  },
>(
  schema: z.ZodObject<T>,
) =>
  schema.refine(
    (val) => (val.rateTDP !== undefined) === (val.rateFFP !== undefined),
    {
      message: "Both TDP and FFP rates are required together",
    },
  );

export const relationsRouter = createTRPCRouter({
  // Ongoing relations
  createOngoing: protectedProcedure
    .input(
      withRateRefine(
        z.object({
          teacherId: z.string(),
          promoModulesId: z.string(),
          workload: z.number().int().positive(),
          rate: rateSchema,
          rateTDP: rateSchema,
          rateFFP: rateSchema,
        }),
      ),
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

  updateOngoing: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
        promoModulesId: z.string(),
        workload: z.number().int().positive(),
        rate: rateSchema,
        rateTDP: rateSchema,
        rateFFP: rateSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { teacherId, promoModulesId, workload, rate, rateTDP, rateFFP } = input;
        const updateData = {
          workload,
          ...(rate !== undefined && { rate }),
          ...(rateTDP !== undefined && { rateTDP }),
          ...(rateFFP !== undefined && { rateFFP }),
        };
        const result = await ctx.db.ongoing.update({
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
        console.error("Error updating ongoing relation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update ongoing relation",
        });
      }
    }),

  deleteOngoing: protectedProcedure
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
  createPotential: protectedProcedure
    .input(
      withRateRefine(
        z.object({
          teacherId: z.string(),
          promoModulesId: z.string(),
          workload: z.number().int().positive(),
          rate: rateSchema,
          rateTDP: rateSchema,
          rateFFP: rateSchema,
          interview_date: z.date().optional(),
          interview_comments: z.string().optional(),
          decision: z.boolean().optional(),
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { teacherId, promoModulesId, workload, rate, rateTDP, rateFFP, interview_date, interview_comments, decision } = input;
        const result = await ctx.db.potential.create({
          data: {
            teacherId,
            promoModulesId,
            workload,
            ...(rate !== undefined && { rate }),
            ...(rateTDP !== undefined && { rateTDP }),
            ...(rateFFP !== undefined && { rateFFP }),
            ...(interview_date !== undefined && { interview_date }),
            ...(interview_comments !== undefined && { interview_comments }),
            ...(decision !== undefined && { decision }),
          },
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

  updatePotential: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
        promoModulesId: z.string(),
        workload: z.number().int().positive().optional(),
        rate: rateSchema,
        rateTDP: rateSchema,
        rateFFP: rateSchema,
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

  deletePotential: protectedProcedure
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
  createSelected: protectedProcedure
    .input(
      withRateRefine(
        z.object({
          teacherId: z.string(),
          promoModulesId: z.string(),
          workload: z.number().int().positive(),
          rate: rateSchema,
          rateTDP: rateSchema,
          rateFFP: rateSchema,
        }),
      ),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { teacherId, promoModulesId, workload, rate, rateTDP, rateFFP } = input;
        const result = await ctx.db.selected.create({
          data: {
            teacherId,
            promoModulesId,
            workload,
            ...(rate !== undefined && { rate }),
            ...(rateTDP !== undefined && { rateTDP }),
            ...(rateFFP !== undefined && { rateFFP }),
          },
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

  updateSelected: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
        promoModulesId: z.string(),
        workload: z.number().int().positive(),
        rate: rateSchema,
        rateTDP: rateSchema,
        rateFFP: rateSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { teacherId, promoModulesId, workload, rate, rateTDP, rateFFP } = input;
        const updateData = {
          workload,
          ...(rate !== undefined && { rate }),
          ...(rateTDP !== undefined && { rateTDP }),
          ...(rateFFP !== undefined && { rateFFP }),
        };
        const result = await ctx.db.selected.update({
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
        console.error("Error updating selected relation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update selected relation",
        });
      }
    }),

  deleteSelected: protectedProcedure
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
