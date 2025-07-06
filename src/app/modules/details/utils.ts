import type {
  PromoModule,
  WorkloadStats,
  TeacherRelation,
  PotentialRelation,
} from "./types";
import {
  getTotalWorkload,
  getWorkloadStatusColor as getWorkloadStatusColorFromUtils,
  getWorkloadStatusText as getWorkloadStatusTextFromUtils,
  getRelationStatusColor,
} from "~/lib/utils";
import type { Decimal } from "@prisma/client/runtime/library";

// Type for raw API response with Prisma Decimal types
type PrismaTeacherRelation = {
  teacherId: string;
  promoModulesId: string;
  workload: number;
  rate?: Decimal | null;
  teacher: {
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
    cv_filename?: string | null;
    cv_uploaded_at?: Date | null;
  };
};

type PrismaPotentialRelation = PrismaTeacherRelation & {
  interview_date?: Date | null;
  interview_comments?: string | null;
  decision?: boolean | null;
};

export type RawPromoModule = {
  id: string;
  moduleId: string;
  promoId: string;
  workload: number;
  promo: {
    id: string;
    level: string;
    specialty: string;
  };
  module: {
    id: string;
    name: string;
  };
  ongoing?: PrismaTeacherRelation[];
  potential?: PrismaPotentialRelation[];
  selected?: PrismaTeacherRelation[];
};

export const extractNumericRate = (rate: unknown): number => {
  if (typeof rate === "number") return rate;
  if (rate && typeof rate === "object" && "toNumber" in rate) {
    try {
      return (rate as { toNumber: () => number }).toNumber();
    } catch {
      return 0;
    }
  }
  return 0;
};

// Transform Prisma Decimal types to number types for frontend consumption
export const transformPrismaRelation = (
  relation: PrismaTeacherRelation,
): TeacherRelation => {
  return {
    teacherId: relation.teacherId,
    promoModulesId: relation.promoModulesId,
    workload: relation.workload,
    rate: relation.rate ? extractNumericRate(relation.rate) : null,
    teacher: {
      id: relation.teacher.id,
      lastname: relation.teacher.lastname,
      firstname: relation.teacher.firstname,
      status: relation.teacher.status,
      diploma: relation.teacher.diploma,
      comments: relation.teacher.comments,
      rate: relation.teacher.rate
        ? extractNumericRate(relation.teacher.rate)
        : null,
      email_perso: relation.teacher.email_perso,
      email_ynov: relation.teacher.email_ynov,
      phone_number: relation.teacher.phone_number,
    },
  };
};

export const transformPrismaPotentialRelation = (
  relation: PrismaPotentialRelation,
): PotentialRelation => {
  const base = transformPrismaRelation(relation);
  return {
    ...base,
    interview_date: relation.interview_date,
    interview_comments: relation.interview_comments,
    decision: relation.decision,
  };
};

export const transformPromoModule = (raw: RawPromoModule): PromoModule => {
  return {
    id: raw.id,
    moduleId: raw.moduleId,
    promoId: raw.promoId,
    workload: raw.workload,
    promo: raw.promo,
    module: raw.module,
    ongoing: raw.ongoing?.map(transformPrismaRelation),
    potential: raw.potential?.map(transformPrismaPotentialRelation),
    selected: raw.selected?.map(transformPrismaRelation),
  };
};

export const calculateWorkloadStats = (module: PromoModule): WorkloadStats => {
  const baseWorkload = module.workload;

  const ongoingTotal = getTotalWorkload(module.ongoing);
  const potentialTotal = getTotalWorkload(module.potential);
  const selectedTotal = getTotalWorkload(module.selected);

  // Calculate costs and average rates
  const calculateCostAndRate = (
    relations: (TeacherRelation | PotentialRelation)[] = [],
  ) => {
    if (!relations.length) return { cost: 0, averageRate: 0 };

    let totalCost = 0;
    let totalRateSum = 0;
    let validRates = 0;

    relations.forEach((relation) => {
      const workload = relation.workload ?? 0;
      let rate = 0;

      // Get rate from relation or teacher's default rate
      if (relation.rate !== null && relation.rate !== undefined) {
        rate = relation.rate;
      } else if (relation.teacher?.rate) {
        rate = extractNumericRate(relation.teacher.rate);
      }

      if (rate > 0) {
        totalCost += workload * rate;
        totalRateSum += rate;
        validRates++;
      }
    });

    return {
      cost: Math.round(totalCost * 100) / 100,
      averageRate:
        validRates > 0
          ? Math.round((totalRateSum / validRates) * 100) / 100
          : 0,
    };
  };

  const ongoingStats = calculateCostAndRate(module.ongoing);
  const potentialStats = calculateCostAndRate(module.potential);
  const selectedStats = calculateCostAndRate(module.selected);

  // Seuls les enseignants "Selected" comptent pour l'allocation actuelle
  // OnGoing représente 100% du workload de l'année passée (information isolée)
  // Potential sont des candidats multiples, ne comptent pas dans l'allocation
  const totalAssigned = selectedTotal;
  const coverage = baseWorkload > 0 ? (totalAssigned / baseWorkload) * 100 : 0;

  return {
    baseWorkload,
    ongoingTotal,
    potentialTotal,
    selectedTotal,
    totalAssigned,
    coverage: Math.round(coverage * 100) / 100,
    remaining: Math.max(0, baseWorkload - totalAssigned),
    ongoingCost: ongoingStats.cost,
    potentialCost: potentialStats.cost,
    selectedCost: selectedStats.cost,
    totalSelectedCost: selectedStats.cost,
    averageOngoingRate: ongoingStats.averageRate,
    averagePotentialRate: potentialStats.averageRate,
    averageSelectedRate: selectedStats.averageRate,
  };
};

export const getWorkloadStatusColor = getWorkloadStatusColorFromUtils;

export const getWorkloadStatusText = getWorkloadStatusTextFromUtils;

export const getStatusColor = getRelationStatusColor;
