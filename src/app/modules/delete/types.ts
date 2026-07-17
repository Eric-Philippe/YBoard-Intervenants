// Define interfaces for module deletion data from API
export interface Teacher {
  id: string;
  lastname: string;
  firstname: string;
}

export interface Promo {
  id: string;
  level: string;
  specialty: string;
}

export interface PromoModule {
  id: string;
  moduleId: string;
  promoId: string;
  workload: number;
  promo: Promo;
  ongoing?: Array<{
    teacher: Teacher;
  }>;
  potential?: Array<{
    teacher: Teacher;
  }>;
  selected?: Array<{
    teacher: Teacher;
  }>;
}

export interface ModuleWithPromoModules {
  id: string;
  name: string;
  promoModules?: PromoModule[];
}

export interface DeletionStats {
  module: string;
  promoModulesCount: number;
  relationsCount: number;
}
