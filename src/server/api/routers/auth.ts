import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { getJwtSecret } from "~/server/jwt";
import {
  recordFailure,
  recordSuccess,
  retryAfterSeconds,
} from "~/server/rateLimit";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const throttleKey = email.toLowerCase();

      const retryAfter = retryAfterSeconds(throttleKey);
      if (retryAfter > 0) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Trop de tentatives. Réessayez dans ${Math.ceil(retryAfter / 60)} minute(s).`,
        });
      }

      try {
        const user = await ctx.db.users.findFirst({
          where: { email },
        });

        if (!user?.password) {
          recordFailure(throttleKey);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          recordFailure(throttleKey);
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        recordSuccess(throttleKey);

        // Update last connected
        await ctx.db.users.update({
          where: { id: user.id },
          data: { last_connected: new Date() },
        });

        const token = jwt.sign({ userId: user.id }, getJwtSecret(), {
          expiresIn: "7d",
          algorithm: "HS256",
        });

        return {
          user: {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            last_connected: user.last_connected,
          },
          token,
        };
      } catch (error) {
        // Sans ce ré-throw, l'échec d'authentification (401) était converti en
        // 500 "Login failed", masquant la vraie cause et le blocage.
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Login failed",
        });
      }
    }),

  // Account creation is reserved to authenticated users: an open registration
  // endpoint let anyone grant themselves access to the whole application.
  register: protectedProcedure
    .input(
      z.object({
        firstname: z.string().min(1),
        lastname: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
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
            message: "User already exists",
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
        });

        return {
          user: {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            last_connected: user.last_connected,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Registration failed",
        });
      }
    }),
});
