import type { Ongoing, Potential, Selected } from "~/types";

interface RelationCardProps {
  relation: Ongoing | Potential | Selected;
  colorScheme: {
    cardBorder: string;
    badge: string;
  };
}

export function RelationCard({ relation, colorScheme }: RelationCardProps) {
  return (
    <div className={`rounded-md border ${colorScheme.cardBorder} bg-white p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">
            📚 {relation.promoModules.module.name}
          </h3>
          <p className="text-sm text-gray-600">
            🎓 {relation.promoModules.promo.level}{" "}
            {relation.promoModules.promo.specialty}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorScheme.badge}`}
          >
            {relation.workload}h
          </span>
          <p className="mt-1 text-xs text-gray-500">
            Module: {relation.promoModules.workload}h total
          </p>
        </div>
      </div>
    </div>
  );
}
