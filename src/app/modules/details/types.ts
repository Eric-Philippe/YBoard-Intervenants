// Define interfaces for module data from API based on Prisma schema
export interface Teacher {
  id: string;
  lastname: string;
  firstname: string;
  status?: string | null;
  diploma?: string | null;
  comments?: string | null;
  rate?: unknown; // Decimal type from Prisma can be complex, using unknown for type safety
  email_perso?: string | null;
  email_ynov?: string | null;
  phone_number?: string | null;
}

export interface Promo {
  id: string;
  level: string;
  specialty: string;
  promoModules?: Array<{
    workload: number;
    module: {
      id: string;
      name: string;
    };
  }>;
}

export interface TeacherRelation {
  teacherId: string;
  promoModulesId: string;
  workload: number;
  teacher: Teacher;
}

export interface PotentialRelation extends TeacherRelation {
  interview_date?: Date | null;
  interview_comments?: string | null;
  decision?: boolean | null;
}

export interface PromoModule {
  id: string;
  moduleId: string;
  promoId: string;
  workload: number;
  promo: Promo;
  module: {
    id: string;
    name: string;
  };
  ongoing?: TeacherRelation[];
  potential?: PotentialRelation[];
  selected?: TeacherRelation[];
}

export interface WorkloadStats {
  baseWorkload: number;
  ongoingTotal: number;
  potentialTotal: number;
  selectedTotal: number;
  totalAssigned: number;
  coverage: number;
  remaining: number;
}

export type TeacherStatus = "ongoing" | "potential" | "selected";
