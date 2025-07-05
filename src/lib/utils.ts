import type { PromoModule, Teacher, User } from "~/types";

/**
 * Date formatting utilities
 */

/**
 * Formats a date to display the last connection time in French
 * @param date - The date to format (can be null or undefined)
 * @returns Formatted date string or "Jamais connecté" if no date
 */
export const formatLastConnected = (date?: Date | null): string => {
  if (!date) return "Jamais connecté";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
};

/**
 * Formats a date to display in full format with time
 * @param date - The date to format (can be null or undefined)
 * @returns Formatted date string or "Jamais connecté" if no date
 */
export const formatLastConnectedFull = (date?: Date | null): string => {
  if (!date) return "Jamais connecté";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
};

/**
 * Relations counting utilities
 */

/**
 * Counts the total number of relations (ongoing + potential + selected) for a PromoModule
 * @param promoModule - The promo module to count relations for
 * @returns Total number of relations
 */
export const getPromoModuleRelationsCount = (
  promoModule: PromoModule,
): number => {
  const ongoing = promoModule.ongoing?.length ?? 0;
  const potential = promoModule.potential?.length ?? 0;
  const selected = promoModule.selected?.length ?? 0;
  return ongoing + potential + selected;
};

/**
 * Collection counting utilities for entities with promoModules
 */

interface EntityWithPromoModules {
  promoModules?: PromoModule[];
}

/**
 * Counts the number of promo modules for an entity (Promo or Module)
 * @param entity - The entity with promoModules
 * @returns Number of promo modules
 */
export const getPromoModulesCount = (
  entity: EntityWithPromoModules,
): number => {
  return entity.promoModules?.length ?? 0;
};

/**
 * Counts the total number of relations for an entity with promo modules
 * @param entity - The entity with promoModules
 * @returns Total number of relations across all promo modules
 */
export const getTotalRelationsCount = (
  entity: EntityWithPromoModules,
): number => {
  if (!entity.promoModules) return 0;

  return entity.promoModules.reduce((total, promoModule) => {
    return total + getPromoModuleRelationsCount(promoModule);
  }, 0);
};

/**
 * Teacher utilities
 */

/**
 * Gets the full name of a teacher
 * @param teacher - The teacher object
 * @returns Full name in "Firstname Lastname" format
 */
export const getTeacherFullName = (teacher: Teacher): string => {
  return `${teacher.firstname} ${teacher.lastname}`;
};

/**
 * Gets the display name of a teacher with status if available
 * @param teacher - The teacher object
 * @returns Display name with status
 */
export const getTeacherDisplayName = (teacher: Teacher): string => {
  const fullName = getTeacherFullName(teacher);
  return teacher.status ? `${fullName} (${teacher.status})` : fullName;
};

/**
 * User utilities
 */

/**
 * Gets the full name of a user
 * @param user - The user object
 * @returns Full name in "Firstname Lastname" format
 */
export const getUserFullName = (user: User): string => {
  return `${user.firstname} ${user.lastname}`;
};

/**
 * String utilities
 */

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncates a string to a specified length with ellipsis
 * @param str - The string to truncate
 * @param maxLength - Maximum length of the string
 * @returns Truncated string with ellipsis if needed
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
};

/**
 * Array utilities
 */

/**
 * Groups an array of objects by a specified key
 * @param array - The array to group
 * @param key - The key to group by
 * @returns Object with grouped items
 */
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K,
): Record<string, T[]> => {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key]);
      groups[groupKey] ??= [];
      groups[groupKey].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
};

/**
 * Removes duplicates from an array based on a key
 * @param array - The array to deduplicate
 * @param key - The key to use for comparison
 * @returns Array without duplicates
 */
export const uniqueBy = <T, K extends keyof T>(array: T[], key: K): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const keyValue = item[key];
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
};

/**
 * Number utilities
 */

/**
 * Formats a number as a percentage
 * @param value - The value to format
 * @param total - The total to calculate percentage from
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number,
  total: number,
  decimals = 1,
): string => {
  if (total === 0) return "0%";
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Teacher status utilities
 */

/**
 * Get the appropriate CSS classes for teacher status badges
 * @param status - The teacher status
 * @returns CSS classes for the status badge
 */
export const getStatusBadgeColor = (status?: string | null): string => {
  switch (status) {
    case "Salaried":
      return "bg-green-100 text-green-800";
    case "Contractor":
      return "bg-blue-100 text-blue-800";
    case "To be recruited":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Get status color for relation types
 * @param status - The relation status (ongoing, potential, selected)
 * @returns CSS classes for the status
 */
export const getRelationStatusColor = (status: string): string => {
  switch (status) {
    case "ongoing":
      return "bg-green-100 text-green-800 border-green-200";
    case "potential":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "selected":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

/**
 * Workload calculation utilities
 */

interface WorkloadItem {
  workload: number;
}

/**
 * Calculate total workload for a list of relations
 * @param relations - Array of relations with workload property
 * @returns Total workload
 */
export const getTotalWorkload = (relations?: WorkloadItem[]): number => {
  return relations?.reduce((total, rel) => total + rel.workload, 0) ?? 0;
};

/**
 * Get workload status color based on coverage percentage
 * @param coverage - Coverage percentage
 * @returns CSS classes for workload status
 */
export const getWorkloadStatusColor = (coverage: number): string => {
  if (coverage < 50) return "text-red-600 bg-red-50";
  if (coverage < 80) return "text-orange-600 bg-orange-50";
  if (coverage <= 100) return "text-green-600 bg-green-50";
  return "text-purple-600 bg-purple-50"; // Over-allocated
};

/**
 * Get workload status text based on coverage percentage
 * @param coverage - Coverage percentage
 * @returns Descriptive text for workload status
 */
export const getWorkloadStatusText = (coverage: number): string => {
  if (coverage < 50) return "Sous-alloué (Selected)";
  if (coverage < 80) return "Partiellement alloué (Selected)";
  if (coverage <= 100) return "Correctement alloué (Selected)";
  return "Sur-alloué (Selected)";
};

/**
 * Format rate display
 * @param rate - The rate value
 * @returns Formatted rate string
 */
export const formatRate = (rate?: number | null): string => {
  return rate ? `${rate}€/h` : "Non spécifié";
};

/**
 * Validation utilities
 */

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns True if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a phone number (basic French format)
 * @param phone - The phone number to validate
 * @returns True if phone number is valid
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(?:(?:\+33|0)[1-9](?:[0-9]{8}))$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};
