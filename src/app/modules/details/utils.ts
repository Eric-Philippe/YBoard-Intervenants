import type { PromoModule, WorkloadStats } from "./types";
import {
  getTotalWorkload,
  getWorkloadStatusColor as getWorkloadStatusColorFromUtils,
  getWorkloadStatusText as getWorkloadStatusTextFromUtils,
  getRelationStatusColor,
} from "~/lib/utils";

export const calculateWorkloadStats = (module: PromoModule): WorkloadStats => {
  const baseWorkload = module.workload;

  const ongoingTotal = getTotalWorkload(module.ongoing);
  const potentialTotal = getTotalWorkload(module.potential);
  const selectedTotal = getTotalWorkload(module.selected);

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
  };
};

export const getWorkloadStatusColor = getWorkloadStatusColorFromUtils;

export const getWorkloadStatusText = getWorkloadStatusTextFromUtils;

export const getStatusColor = getRelationStatusColor;
