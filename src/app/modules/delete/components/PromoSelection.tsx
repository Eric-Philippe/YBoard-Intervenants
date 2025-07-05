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
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        📋 Sélectionnez une Promo
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => (
          <button
            key={promo.id}
            onClick={() => onPromoSelect(promo)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              selectedPromo?.id === promo.id
                ? "border-red-500 bg-red-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="font-semibold text-gray-900">
              {promo.level} - {promo.specialty}
            </div>
            <div className="text-sm text-gray-500">
              Cliquez pour voir les modules à supprimer
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
