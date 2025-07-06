import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const teachersRouter = createTRPCRouter({
  getCount: publicProcedure.query(async ({ ctx }) => {
    try {
      const count = await ctx.db.teacher.count();
      return count;
    } catch (error) {
      console.error("Error counting teachers:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to count teachers",
      });
    }
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const teachers = await ctx.db.teacher.findMany({
        include: {
          ongoing: {
            include: {
              promoModules: {
                include: {
                  module: true,
                  promo: true,
                },
              },
            },
          },
          potential: {
            include: {
              promoModules: {
                include: {
                  module: true,
                  promo: true,
                },
              },
            },
          },
          selected: {
            include: {
              promoModules: {
                include: {
                  module: true,
                  promo: true,
                },
              },
            },
          },
        },
      });
      return teachers;
    } catch (error) {
      console.error("Error fetching teachers:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch teachers",
      });
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const teacher = await ctx.db.teacher.findUnique({
          where: { id: input.id },
          include: {
            ongoing: {
              include: {
                promoModules: {
                  include: {
                    module: true,
                    promo: true,
                  },
                },
              },
            },
            potential: {
              include: {
                promoModules: {
                  include: {
                    module: true,
                    promo: true,
                  },
                },
              },
            },
            selected: {
              include: {
                promoModules: {
                  include: {
                    module: true,
                    promo: true,
                  },
                },
              },
            },
          },
        });

        if (!teacher) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Teacher not found",
          });
        }

        return teacher;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch teacher",
        });
      }
    }),

  create: publicProcedure
    .input(
      z.object({
        firstname: z.string().min(1),
        lastname: z.string().min(1),
        status: z.string().optional(),
        diploma: z.string().optional(),
        comments: z.string().optional(),
        rate: z.number().optional(),
        email_perso: z.string().optional(),
        email_ynov: z.string().optional(),
        phone_number: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const teacher = await ctx.db.teacher.create({
          data: input,
        });
        return teacher;
      } catch (error) {
        console.error("Error creating teacher:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create teacher",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        firstname: z.string().min(1).optional(),
        lastname: z.string().min(1).optional(),
        status: z.string().optional(),
        diploma: z.string().optional(),
        comments: z.string().optional(),
        rate: z.number().optional(),
        email_perso: z.string().optional(),
        email_ynov: z.string().optional(),
        phone_number: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updateData } = input;
        const teacher = await ctx.db.teacher.update({
          where: { id },
          data: updateData,
        });
        return teacher;
      } catch (error) {
        console.error("Error updating teacher:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update teacher",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // First, get the teacher to count relations for response
        const teacher = await ctx.db.teacher.findUnique({
          where: { id: input.id },
          include: {
            ongoing: true,
            potential: true,
            selected: true,
          },
        });

        if (!teacher) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Teacher not found",
          });
        }

        const relationsCount =
          (teacher.ongoing?.length ?? 0) +
          (teacher.potential?.length ?? 0) +
          (teacher.selected?.length ?? 0);

        // Delete the teacher (relations will be deleted by cascade)
        await ctx.db.teacher.delete({
          where: { id: input.id },
        });

        return {
          success: true,
          deletedData: {
            teacher: `${teacher.lastname} ${teacher.firstname}`,
            relationsCount,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete teacher",
        });
      }
    }),

  getAllWithRelations: publicProcedure.query(async ({ ctx }) => {
    try {
      const teachers = await ctx.db.teacher.findMany({
        include: {
          ongoing: {
            include: {
              promoModules: {
                include: {
                  module: true,
                  promo: true,
                },
              },
            },
          },
          potential: {
            include: {
              promoModules: {
                include: {
                  module: true,
                  promo: true,
                },
              },
            },
          },
          selected: {
            include: {
              promoModules: {
                include: {
                  module: true,
                  promo: true,
                },
              },
            },
          },
        },
      });
      return teachers;
    } catch (error) {
      console.error("Error fetching teachers with relations:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch teachers with relations",
      });
    }
  }),

  updateCv: publicProcedure
    .input(
      z.object({
        teacherId: z.string(),
        filename: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const teacher = await ctx.db.teacher.update({
          where: { id: input.teacherId },
          data: {
            cv_filename: input.filename,
            cv_uploaded_at: new Date(),
          },
        });
        return teacher;
      } catch (error) {
        console.error("Error updating teacher CV:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update teacher CV",
        });
      }
    }),

  deleteCv: publicProcedure
    .input(z.object({ teacherId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const teacher = await ctx.db.teacher.findUnique({
          where: { id: input.teacherId },
          select: { cv_filename: true },
        });

        if (!teacher?.cv_filename) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No CV found for this teacher",
          });
        }

        // Update database
        await ctx.db.teacher.update({
          where: { id: input.teacherId },
          data: {
            cv_filename: null,
            cv_uploaded_at: null,
          },
        });

        return { success: true, deletedFilename: teacher.cv_filename };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error deleting teacher CV:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete teacher CV",
        });
      }
    }),
});
