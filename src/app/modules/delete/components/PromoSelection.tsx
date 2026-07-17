import { LuClipboardList } from "react-icons/lu";
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
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
        <LuClipboardList className="h-5 w-5 text-red-600" />
        Sélectionnez une Promo
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map((promo) => (
          <button
            key={promo.id}
            onClick={() => onPromoSelect(promo)}
            className={`surface-hover rounded-xl border-2 p-4 text-left transition-all duration-200 ease-out ${
              selectedPromo?.id === promo.id
                ? "border-red-500 bg-red-50"
                : "glass-panel border-transparent hover:border-red-200"
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
