import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function requireCurrentUser(db: PrismaClient, userId: string) {
  const user = await db.users.findUnique({ where: { id: userId } });
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Utilisateur introuvable" });
  }
  return user;
}

export const perimetersRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const perimeters = await ctx.db.perimeter.findMany({
        include: { _count: { select: { members: true, promos: true } } },
        orderBy: { title: "asc" },
      });
      return perimeters;
    } catch {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch perimeters" });
    }
  }),

  getMine: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [memberships, user] = await Promise.all([
        ctx.db.perimeterMember.findMany({
          where: { userId: ctx.userId },
          include: { perimeter: true },
          orderBy: { perimeter: { title: "asc" } },
        }),
        ctx.db.users.findUnique({ where: { id: ctx.userId } }),
      ]);

      return {
        perimeters: memberships.map((m) => m.perimeter),
        activePerimeterId: user?.activePerimeterId ?? null,
      };
    } catch {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch your perimeters" });
    }
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const perimeter = await ctx.db.perimeter.findUnique({
        where: { id: input.id },
        include: { members: { include: { user: true } } },
      });
      if (!perimeter) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Perimeter not found" });
      }
      return perimeter;
    }),

  getStats: protectedProcedure
    .input(z.object({ perimeterId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const [promoCount, moduleCount, memberCount, promoModules] = await Promise.all([
          ctx.db.promos.count({ where: { perimeterId: input.perimeterId } }),
          ctx.db.modules.count({ where: { perimeterId: input.perimeterId } }),
          ctx.db.perimeterMember.count({ where: { perimeterId: input.perimeterId } }),
          ctx.db.promoModules.findMany({
            where: { promo: { perimeterId: input.perimeterId } },
            select: {
              _count: { select: { selected: true } },
            },
          }),
        ]);

        const totalModules = promoModules.length;
        // Only "selected" counts as staffed/complete: "ongoing" relations are
        // still in discussion and haven't been confirmed yet, so a module
        // with only an ongoing relation must not read as 100% complete.
        const coveredModules = promoModules.filter((pm) => pm._count.selected > 0).length;
        const completionRate = totalModules > 0 ? Math.round((coveredModules / totalModules) * 100) : 0;

        return { promoCount, moduleCount, memberCount, totalModules, coveredModules, completionRate };
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to compute perimeter stats" });
      }
    }),

  create: protectedProcedure
    .input(z.object({ title: z.string().min(1), color: z.string().min(1), short_desc: z.string().max(255).optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await requireCurrentUser(ctx.db, ctx.userId);

        const baseSlug = slugify(input.title) || "perimetre";
        let slug = baseSlug;
        let suffix = 1;
        while (await ctx.db.perimeter.findUnique({ where: { slug } })) {
          suffix += 1;
          slug = `${baseSlug}-${suffix}`;
        }

        const perimeter = await ctx.db.perimeter.create({
          data: {
            title: input.title,
            slug,
            color: input.color,
            ...(input.short_desc !== undefined && { short_desc: input.short_desc }),
            origin: `${user.firstname} ${user.lastname.toUpperCase()}`,
            members: { create: { userId: user.id } },
          },
        });

        await ctx.db.users.update({
          where: { id: user.id },
          data: { activePerimeterId: perimeter.id },
        });

        return perimeter;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create perimeter" });
      }
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string().min(1).optional(), color: z.string().min(1).optional(), short_desc: z.string().max(255).optional().nullable() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...data } = input;
        return await ctx.db.perimeter.update({ where: { id }, data });
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update perimeter" });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const perimeter = await ctx.db.perimeter.findUnique({ where: { id: input.id } });
        if (!perimeter) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Perimeter not found" });
        }

        // Anyone whose active perimeter is the one being deleted needs to be
        // reassigned, otherwise they're left pointing at a perimeter that no
        // longer exists and every perimeter-scoped page breaks for them.
        const affectedUsers = await ctx.db.users.findMany({
          where: { activePerimeterId: input.id },
          select: { id: true },
        });

        await ctx.db.perimeter.delete({ where: { id: input.id } });

        for (const user of affectedUsers) {
          const anotherMembership = await ctx.db.perimeterMember.findFirst({
            where: { userId: user.id },
          });
          await ctx.db.users.update({
            where: { id: user.id },
            data: { activePerimeterId: anotherMembership?.perimeterId ?? null },
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete perimeter" });
      }
    }),

  addMember: protectedProcedure
    .input(z.object({ perimeterId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.perimeterMember.upsert({
          where: { perimeterId_userId: { perimeterId: input.perimeterId, userId: input.userId } },
          create: { perimeterId: input.perimeterId, userId: input.userId },
          update: {},
        });
        return { success: true };
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add member" });
      }
    }),

  removeMember: protectedProcedure
    .input(z.object({ perimeterId: z.string(), userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.perimeterMember.deleteMany({
          where: { perimeterId: input.perimeterId, userId: input.userId },
        });

        const user = await ctx.db.users.findUnique({ where: { id: input.userId } });
        if (user?.activePerimeterId === input.perimeterId) {
          const anotherMembership = await ctx.db.perimeterMember.findFirst({
            where: { userId: input.userId },
          });
          await ctx.db.users.update({
            where: { id: input.userId },
            data: { activePerimeterId: anotherMembership?.perimeterId ?? null },
          });
        }

        return { success: true };
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to remove member" });
      }
    }),

  setActive: protectedProcedure
    .input(z.object({ perimeterId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const membership = await ctx.db.perimeterMember.findUnique({
          where: { perimeterId_userId: { perimeterId: input.perimeterId, userId: ctx.userId } },
        });
        if (!membership) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Vous n'appartenez pas a ce perimetre" });
        }
        await ctx.db.users.update({
          where: { id: ctx.userId },
          data: { activePerimeterId: input.perimeterId },
        });
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to switch active perimeter" });
      }
    }),
});
