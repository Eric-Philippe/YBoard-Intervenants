import type { Promo } from "../types";

interface PromoSelectionProps {
  promos: Promo[];
  selectedPromo: Promo | null;
  onPromoSelect: (promo: Promo) => void;
}

export function PromoSelection({
  promos,
  selectedPromo,
  onPromoSelect,
}: PromoSelectionProps) {
  // Function to calculate total workload for a promo
  const calculateTotalWorkload = (promo: Promo): number => {
    return (
      promo.promoModules?.reduce(
        (total, promoModule) => total + promoModule.workload,
        0,
      ) ?? 0
    );
  };

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        📋 Étape 1: Sélectionnez une Promo
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => {
          const totalWorkload = calculateTotalWorkload(promo);
          const moduleCount = promo.promoModules?.length ?? 0;

          return (
            <button
              key={promo.id}
              onClick={() => onPromoSelect(promo)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                selectedPromo?.id === promo.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="font-semibold text-gray-900">
                {promo.level} - {promo.specialty}
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Modules:</span>
                  <span className="font-medium text-gray-800">
                    {moduleCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total heures:</span>
                  <span className="font-semibold text-blue-600">
                    {totalWorkload}h
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Cliquez pour voir ses modules
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
