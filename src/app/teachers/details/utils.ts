import type { Teacher } from "~/types";
import type { TeacherStatistics, RelationSection } from "./types";
import {
  getStatusBadgeColor as getStatusBadgeColorFromUtils,
  getTotalWorkload as getTotalWorkloadFromUtils,
  formatRate as formatRateFromUtils,
  getTeacherFullName,
} from "~/lib/utils";

/**
 * Get the appropriate CSS classes for status badges
 */
export const getStatusBadgeColor = getStatusBadgeColorFromUtils;

/**
 * Calculate total workload for a list of relations
 */
export const getTotalWorkload = getTotalWorkloadFromUtils;

/**
 * Format teacher's full name
 */
export const formatTeacherName = getTeacherFullName;

/**
 * Format rate display
 */
export const formatRate = formatRateFromUtils;
export const calculateTeacherStatistics = (
  teacher: Teacher,
): TeacherStatistics => {
  const ongoingWorkload = getTotalWorkload(teacher.ongoing);
  const potentialWorkload = getTotalWorkload(teacher.potential);
  const selectedWorkload = getTotalWorkload(teacher.selected);

  return {
    totalRelations:
      (teacher.ongoing?.length ?? 0) +
      (teacher.potential?.length ?? 0) +
      (teacher.selected?.length ?? 0),
    totalWorkload: ongoingWorkload + potentialWorkload + selectedWorkload,
    ongoingWorkload,
    potentialWorkload,
    selectedWorkload,
  };
};

/**
 * Get relation sections with their configuration
 */
export const getRelationSections = (teacher: Teacher): RelationSection[] => {
  return [
    {
      type: "ongoing",
      title: "Relations Ongoing",
      emoji: "🟢",
      relations: teacher.ongoing ?? [],
      colorScheme: {
        bg: "bg-green-50",
        border: "border-green-200",
        cardBorder: "border-green-300",
        badge: "bg-green-100 text-green-800",
        text: "text-green-900",
        totalText: "text-green-800",
      },
    },
    {
      type: "potential",
      title: "Relations Potential",
      emoji: "🟡",
      relations: teacher.potential ?? [],
      colorScheme: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        cardBorder: "border-orange-300",
        badge: "bg-orange-100 text-orange-800",
        text: "text-orange-900",
        totalText: "text-orange-800",
      },
    },
    {
      type: "selected",
      title: "Relations Selected",
      emoji: "🔵",
      relations: teacher.selected ?? [],
      colorScheme: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        cardBorder: "border-blue-300",
        badge: "bg-blue-100 text-blue-800",
        text: "text-blue-900",
        totalText: "text-blue-800",
      },
    },
  ];
};
