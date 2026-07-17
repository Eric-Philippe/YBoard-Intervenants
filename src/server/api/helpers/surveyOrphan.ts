import type { PrismaClient } from "@prisma/client";

/**
 * Snapshots a human-readable "module (promo)" label onto any SurveyResponse rows
 * tied to the given PromoModules before they get deleted. The FK is ON DELETE SET
 * NULL, so the responses themselves survive as orphaned rows instead of being
 * cascade-deleted this just keeps them meaningful to display afterwards.
 */
export async function snapshotOrphanedSurveyResponses(
  db: PrismaClient,
  promoModulesIds: string[],
): Promise<void> {
  if (promoModulesIds.length === 0) return;

  const promoModules = await db.promoModules.findMany({
    where: { id: { in: promoModulesIds } },
    include: { module: true, promo: true },
  });

  for (const pm of promoModules) {
    const label = `${pm.module.name} (${pm.promo.level} - ${pm.promo.specialty})`;
    await db.surveyResponse.updateMany({
      where: { promoModulesId: pm.id },
      data: { moduleLabelSnapshot: label },
    });
  }
}
