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
