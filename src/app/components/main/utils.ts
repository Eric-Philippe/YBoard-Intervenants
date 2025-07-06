import type { Decimal } from "@prisma/client/runtime/library";
import type { CartesianData, GroupedData } from "./types";

// Utility function to convert Decimal to number
export const getNumericRate = (rate: Decimal | null | undefined): number => {
  if (!rate) return 0;
  return typeof rate === "number" ? rate : Number(rate.toString());
};

// Get teacher names as a string
export const getTeacherNames = (
  relations: { teacher: { lastname: string; firstname: string } }[],
) => {
  return relations
    .map((rel) => `${rel.teacher.lastname} ${rel.teacher.firstname}`)
    .join(", ");
};

// Get truncated teacher names
export const getTruncatedTeacherNames = (
  relations: { teacher: { lastname: string; firstname: string } }[],
  maxLength = 30,
) => {
  const fullText = getTeacherNames(relations);
  if (fullText.length <= maxLength) {
    return fullText;
  }
  return fullText.substring(0, maxLength - 3) + "...";
};

// Group data by promo
export const groupByPromo = (data: CartesianData[]): GroupedData => {
  const grouped: GroupedData = {};
  data.forEach((item) => {
    const promoKey = `${item.promoModule.promo.level} ${item.promoModule.promo.specialty}`;
    grouped[promoKey] ??= [];
    grouped[promoKey].push(item);
  });
  return grouped;
};

// localStorage utilities
export const STORAGE_KEY = "yboard-selected-promos";

export const loadSelectedPromos = (): Set<string> => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        return new Set(parsed);
      } catch {
        return new Set();
      }
    }
  }
  return new Set();
};

export const saveSelectedPromos = (promos: Set<string>) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(promos)));
  }
};
