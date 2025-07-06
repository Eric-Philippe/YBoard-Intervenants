import type { Decimal } from "@prisma/client/runtime/library";

// Type utility to convert Prisma Decimal to number
export type DecimalToNumber<T> = T extends Decimal ? number : T;

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  last_connected?: Date;
}

export interface Promo {
  id: string;
  level: string;
  specialty: string;
  promoModules?: PromoModule[];
}

export interface Module {
  id: string;
  name: string;
  promoModules?: PromoModule[];
}

export interface Teacher {
  id: string;
  lastname: string;
  firstname: string;
  status?: string;
  diploma?: string;
  comments?: string;
  rate?: number;
  email_perso?: string;
  email_ynov?: string;
  phone_number?: string;
  cv_filename?: string;
  cv_uploaded_at?: Date;
  ongoing?: Ongoing[];
  potential?: Potential[];
  selected?: Selected[];
}

export interface PromoModule {
  id: string;
  moduleId: string;
  promoId: string;
  workload: number;
  module: Module;
  promo: Promo;
  ongoing?: TeacherRelation[];
  potential?: TeacherRelation[];
  selected?: TeacherRelation[];
}

export interface Ongoing {
  teacherId: string;
  promoModulesId: string;
  workload: number;
  rate?: number;
  teacher: Teacher;
  promoModules: PromoModule;
}

export interface Potential {
  teacherId: string;
  promoModulesId: string;
  workload: number;
  rate?: number;
  interview_date?: Date;
  interview_comments?: string;
  decision?: boolean;
  teacher: Teacher;
  promoModules: PromoModule;
}

export interface Selected {
  teacherId: string;
  promoModulesId: string;
  workload: number;
  rate?: number;
  teacher: Teacher;
  promoModules: PromoModule;
}

// Types for Prisma results with Decimal values
export interface TeacherRelation {
  teacherId: string;
  promoModulesId: string;
  workload: number;
  rate?: number | null;
  interview_date?: Date | null;
  interview_comments?: string | null;
  decision?: boolean | null;
  teacher: {
    id: string;
    lastname: string;
    firstname: string;
    status?: string | null;
    diploma?: string | null;
    comments?: string | null;
    rate?: number | null;
    email_perso?: string | null;
    email_ynov?: string | null;
    phone_number?: string | null;
    cv_filename?: string | null;
    cv_uploaded_at?: Date | null;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CartesianData {
  id: string;
  level: string;
  specialty: string;
  moduleName: string;
  workload: number;
  ongoingTeachers: Teacher[];
  potentialTeachers: Teacher[];
  selectedTeachers: Teacher[];
}

export type TeacherStatus = "Contractor" | "Salaried" | "To be recruited";
export type PromoLevel = "B1" | "B2" | "B3" | "M1" | "M2";
