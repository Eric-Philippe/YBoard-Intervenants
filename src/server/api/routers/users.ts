import { z } from "zod";
import bcrypt from "bcrypt";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const usersRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.users.findMany({
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          last_connected: true,
        },
        orderBy: [{ lastname: "asc" }, { firstname: "asc" }],
      });

      return users;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch users",
      });
    }
  }),

  getCount: publicProcedure.query(async ({ ctx }) => {
    try {
      const count = await ctx.db.users.count();
      return count;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to count users",
      });
    }
  }),

  create: publicProcedure
    .input(
      z.object({
        firstname: z.string().min(1, "Le prénom est requis"),
        lastname: z.string().min(1, "Le nom est requis"),
        email: z.string().email("Email invalide"),
        password: z
          .string()
          .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { firstname, lastname, email, password } = input;

      try {
        // Check if user already exists
        const existingUser = await ctx.db.users.findFirst({
          where: { email },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Un utilisateur avec cet email existe déjà",
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await ctx.db.users.create({
          data: {
            firstname,
            lastname,
            email,
            password: hashedPassword,
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            last_connected: true,
          },
        });

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Échec de la création de l'utilisateur",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        firstname: z.string().min(1, "Le prénom est requis"),
        lastname: z.string().min(1, "Le nom est requis"),
        email: z.string().email("Email invalide"),
        password: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, firstname, lastname, email, password } = input;

      try {
        // Check if another user has the same email
        const existingUser = await ctx.db.users.findFirst({
          where: {
            email,
            NOT: { id },
          },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Un autre utilisateur avec cet email existe déjà",
          });
        }

        // Prepare update data
        const updateData: {
          firstname: string;
          lastname: string;
          email: string;
          password?: string;
        } = {
          firstname,
          lastname,
          email,
        };

        // Hash new password if provided
        if (password && password.trim() !== "") {
          if (password.length < 6) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Le mot de passe doit contenir au moins 6 caractères",
            });
          }
          updateData.password = await bcrypt.hash(password, 10);
        }

        // Update user
        const user = await ctx.db.users.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            last_connected: true,
          },
        });

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Échec de la modification de l'utilisateur",
        });
      }
    }),

  delete: publicProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      try {
        const deletedUsers = await ctx.db.users.deleteMany({
          where: {
            id: {
              in: input,
            },
          },
        });

        return {
          count: deletedUsers.count,
          message: `${deletedUsers.count} utilisateur(s) supprimé(s) avec succès`,
        };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Échec de la suppression des utilisateurs",
        });
      }
    }),

  updateProfile: publicProcedure
    .input(
      z.object({
        id: z.string(),
        firstname: z.string().min(1, "Le prénom est requis"),
        lastname: z.string().min(1, "Le nom est requis"),
        email: z.string().email("Email invalide"),
        currentPassword: z.string().optional(),
        newPassword: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, firstname, lastname, email, currentPassword, newPassword } =
        input;

      try {
        // Check if another user has the same email
        const existingUser = await ctx.db.users.findFirst({
          where: {
            email,
            NOT: { id },
          },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Un autre utilisateur avec cet email existe déjà",
          });
        }

        // If changing password, verify current password
        if (newPassword && newPassword.trim() !== "") {
          if (!currentPassword) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "Le mot de passe actuel est requis pour changer le mot de passe",
            });
          }

          // Get current user to verify password
          const currentUser = await ctx.db.users.findUnique({
            where: { id },
            select: { password: true },
          });

          if (!currentUser?.password) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Utilisateur non trouvé",
            });
          }

          const isValidPassword = await bcrypt.compare(
            currentPassword,
            currentUser.password,
          );
          if (!isValidPassword) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Mot de passe actuel incorrect",
            });
          }

          if (newPassword.length < 6) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "Le nouveau mot de passe doit contenir au moins 6 caractères",
            });
          }
        }

        // Prepare update data
        const updateData: {
          firstname: string;
          lastname: string;
          email: string;
          password?: string;
        } = {
          firstname,
          lastname,
          email,
        };

        // Hash new password if provided
        if (newPassword && newPassword.trim() !== "") {
          updateData.password = await bcrypt.hash(newPassword, 10);
        }

        // Update user
        const user = await ctx.db.users.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            last_connected: true,
          },
        });

        return user;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Échec de la modification du profil",
        });
      }
    }),
});
