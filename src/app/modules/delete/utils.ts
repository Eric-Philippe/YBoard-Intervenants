import type { ModuleWithPromoModules } from "./types";

/**
 * Count the number of promo modules for a given module
 */
export const getPromoModulesCount = (
  moduleItem: ModuleWithPromoModules,
): number => {
  return moduleItem.promoModules?.length ?? 0;
};

/**
 * Count the total number of relations (ongoing + potential + selected) for a given module
 */
export const getRelationsCount = (
  moduleItem: ModuleWithPromoModules,
): number => {
  if (!moduleItem.promoModules) return 0;

  return moduleItem.promoModules.reduce((total, promoModule) => {
    const ongoing = promoModule.ongoing?.length ?? 0;
    const potential = promoModule.potential?.length ?? 0;
    const selected = promoModule.selected?.length ?? 0;
    return total + ongoing + potential + selected;
  }, 0);
};
