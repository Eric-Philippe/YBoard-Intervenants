import type { Decimal } from "@prisma/client/runtime/library";

export interface CartesianData {
  promoModule: {
    id: string;
    moduleId: string;
    promoId: string;
    workload: number;
    module: { id: string; name: string };
    promo: { id: string; level: string; specialty: string };
  };
  ongoing: Array<{
    teacher: { id: string; lastname: string; firstname: string };
  }>;
  potential: Array<{
    teacher: { id: string; lastname: string; firstname: string };
  }>;
  selected: Array<{
    teacher: { id: string; lastname: string; firstname: string };
  }>;
}

export interface Teacher {
  id: string;
  lastname: string;
  firstname: string;
  rate?: Decimal | null;
}

export interface CurrentRelation {
  type: "ongoing" | "potential" | "selected";
  promoModuleId: string;
  moduleWorkload: number;
}

export type GroupedData = Record<string, CartesianData[]>;
