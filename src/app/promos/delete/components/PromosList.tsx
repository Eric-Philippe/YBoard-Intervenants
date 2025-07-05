import type { PromoWithModules } from "../types";
import { PromoCard } from "./PromoCard";

interface PromosListProps {
  promos: PromoWithModules[];
  showDetails: string | null;
  onToggleDetails: (promoId: string) => void;
  onDeleteClick: (promo: PromoWithModules) => void;
  loading: boolean;
}

export function PromosList({
  promos,
  showDetails,
  onToggleDetails,
  onDeleteClick,
  loading,
}: PromosListProps) {
  return (
    <div className="space-y-4">
      {promos.map((promo) => (
        <PromoCard
          key={promo.id}
          promo={promo}
          showDetails={showDetails === promo.id}
          onToggleDetails={() => onToggleDetails(promo.id)}
          onDeleteClick={() => onDeleteClick(promo)}
          loading={loading}
        />
      ))}
    </div>
  );
}
