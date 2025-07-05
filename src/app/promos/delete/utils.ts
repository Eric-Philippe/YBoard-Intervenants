import type { PromoWithModules } from "./types";

/**
 * Count the number of promo modules for a given promo
 */
export const getPromoModulesCount = (promo: PromoWithModules): number => {
  return promo.promoModules?.length ?? 0;
};

/**
 * Count the total number of relations (ongoing + potential + selected) for a given promo
 */
export const getRelationsCount = (promo: PromoWithModules): number => {
  if (!promo.promoModules) return 0;

  return promo.promoModules.reduce((total, promoModule) => {
    const ongoing = promoModule.ongoing?.length ?? 0;
    const potential = promoModule.potential?.length ?? 0;
    const selected = promoModule.selected?.length ?? 0;
    return total + ongoing + potential + selected;
  }, 0);
};
