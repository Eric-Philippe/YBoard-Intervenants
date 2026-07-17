import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";

/**
 * Resolves the perimeter a request should be scoped to: an explicit override (used by the
 * "vue d'ensemble" page which can browse any perimeter) or the current user's active perimeter.
 */
export async function resolvePerimeterId(
  db: PrismaClient,
  userId: string | null,
  override?: string,
): Promise<string> {
  if (override) return override;

  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentification requise",
    });
  }
  const user = await db.users.findUnique({
    where: { id: userId },
    select: { activePerimeterId: true },
  });
  if (!user?.activePerimeterId) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Aucun périmètre actif selectionné",
    });
  }
  return user.activePerimeterId;
}
