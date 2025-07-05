import type { Ongoing, Potential, Selected } from "~/types";

// Define interfaces for teacher data from API
export interface PromoModule {
  id: string;
  workload: number;
  module: { name: string };
  promo: { level: string; specialty: string };
}

export interface TeacherStatistics {
  totalRelations: number;
  totalWorkload: number;
  ongoingWorkload: number;
  potentialWorkload: number;
  selectedWorkload: number;
}

export type RelationType = "ongoing" | "potential" | "selected";

export interface RelationSection {
  type: RelationType;
  title: string;
  emoji: string;
  relations: Ongoing[] | Potential[] | Selected[];
  colorScheme: {
    bg: string;
    border: string;
    cardBorder: string;
    badge: string;
    text: string;
    totalText: string;
  };
}
