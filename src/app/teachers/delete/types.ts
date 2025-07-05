import type { Decimal } from "@prisma/client/runtime/library";

// Define interfaces for teacher data from API
export interface Teacher {
  id: string;
  lastname: string;
  firstname: string;
  status?: string | null;
  diploma?: string | null;
  comments?: string | null;
  rate?: Decimal | null;
  email_perso?: string | null;
  email_ynov?: string | null;
  phone_number?: string | null;
  ongoing?: Array<{
    promoModules: {
      module: { name: string };
      promo: { level: string; specialty: string };
    };
  }>;
  potential?: Array<{
    promoModules: {
      module: { name: string };
      promo: { level: string; specialty: string };
    };
  }>;
  selected?: Array<{
    promoModules: {
      module: { name: string };
      promo: { level: string; specialty: string };
    };
  }>;
}

export interface DeletionStats {
  teacher: string;
  relationsCount: number;
}
