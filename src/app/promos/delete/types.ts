// Define interfaces for promo deletion data from API
export interface Teacher {
  id: string;
  lastname: string;
  firstname: string;
}

export interface Module {
  id: string;
  name: string;
}

export interface PromoModule {
  id: string;
  moduleId: string;
  promoId: string;
  workload: number;
  module: Module;
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

export interface PromoWithModules {
  id: string;
  level: string;
  specialty: string;
  promoModules?: PromoModule[];
}

export interface DeletionStats {
  promo: string;
  promoModulesCount: number;
  relationsCount: number;
}
