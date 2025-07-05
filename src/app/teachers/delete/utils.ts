import type { Teacher } from "./types";
import { getStatusBadgeColor as getStatusBadgeColorFromUtils } from "~/lib/utils";

/**
 * Count the number of relations (ongoing + potential + selected) for a given teacher
 */
export const getRelationsCount = (teacher: Teacher): number => {
  const ongoing = teacher.ongoing?.length ?? 0;
  const potential = teacher.potential?.length ?? 0;
  const selected = teacher.selected?.length ?? 0;
  return ongoing + potential + selected;
};

/**
 * Get the appropriate badge color for a teacher status
 */
export const getStatusBadgeColor = getStatusBadgeColorFromUtils;
