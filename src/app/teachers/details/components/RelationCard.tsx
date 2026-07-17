import type { Ongoing, Potential, Selected } from "~/types";
import { IconBook, IconSchool } from "@tabler/icons-react";
import {
  calculateAssignationCost,
  getCalculationModeColor,
  getCalculationModeLabel,
} from "~/lib/utils";

interface RelationCardProps {
  relation: Ongoing | Potential | Selected;
  colorScheme: {
    cardBorder: string;
    badge: string;
  };
}

export function RelationCard({ relation, colorScheme }: RelationCardProps) {
  const relationModule = relation.promoModules.module;
  const { cost, mode } = calculateAssignationCost({
    workload: relation.workload,
    rate: relation.rate,
    rateTDP: relation.rateTDP,
    rateFFP: relation.rateFFP,
    teacherRate: relation.teacher?.rate,
    moduleNombreHeureTDP: relationModule.nombreHeureTDP,
    moduleNombreHeureFFP: relationModule.nombreHeureFFP,
  });

  return (
    <div className={`glass-panel surface-hover rounded-md border ${colorScheme.cardBorder} p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="flex items-center gap-2 font-medium text-gray-900">
            <IconBook size={16} />
            {relation.promoModules.module.name}
          </h3>
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <IconSchool size={14} />
            {relation.promoModules.promo.level}{" "}
            {relation.promoModules.promo.specialty}
          </p>
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end space-y-1">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorScheme.badge}`}
            >
              {relation.workload}h
            </span>
            {mode === "tdp_ffp" ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                TDP {relation.rateTDP}€/h · FFP {relation.rateFFP}€/h
              </span>
            ) : (
              relation.rate && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  {relation.rate}€/h
                </span>
              )
            )}
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getCalculationModeColor(mode)}`}
            >
              {getCalculationModeLabel(mode)}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Module: {relation.promoModules.workload}h total
            {relationModule.nombreHeureTDP != null && relationModule.nombreHeureFFP != null && (
              <> (TDP {relationModule.nombreHeureTDP}h / FFP {relationModule.nombreHeureFFP}h)</>
            )}
          </p>
          {cost > 0 && (
            <p className="text-xs text-gray-500">Total: {cost.toFixed(2)}€</p>
          )}
        </div>
      </div>
    </div>
  );
}
