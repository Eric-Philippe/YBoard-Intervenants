import type { CartesianData, GroupedData } from "./types";

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

// localStorage utilities — keyed per perimeter so switching preserves each perimeter's selection
const storageKey = (perimeterId?: string) =>
  perimeterId ? `yboard-selected-promos-${perimeterId}` : "yboard-selected-promos";

export const loadSelectedPromos = (perimeterId?: string): Set<string> => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey(perimeterId));
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

export const saveSelectedPromos = (promos: Set<string>, perimeterId?: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey(perimeterId), JSON.stringify(Array.from(promos)));
  }
};
