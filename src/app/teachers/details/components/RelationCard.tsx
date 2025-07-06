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
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">
            📚 {relation.promoModules.module.name}
          </h3>
          <p className="text-sm text-gray-600">
            🎓 {relation.promoModules.promo.level}{" "}
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
            {relation.rate && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                {relation.rate}€/h
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Module: {relation.promoModules.workload}h total
          </p>
          {relation.rate && (
            <p className="text-xs text-gray-500">
              Total: {(relation.workload * relation.rate).toFixed(2)}€
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
