import { LuTrash2 } from "react-icons/lu";
import type { ModuleWithPromoModules, Promo } from "../types";
import { ModuleCard } from "./ModuleCard";

interface ModulesListProps {
  selectedPromo: Promo;
  modules: ModuleWithPromoModules[];
  showDetails: string | null;
  loading: boolean;
  onToggleDetails: (moduleId: string) => void;
  onDeleteClick: (module: ModuleWithPromoModules) => void;
}

export function ModulesList({
  selectedPromo,
  modules,
  showDetails,
  loading,
  onToggleDetails,
  onDeleteClick,
}: ModulesListProps) {
  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
        <LuTrash2 className="h-5 w-5 text-red-600" />
        Modules de {selectedPromo.level} - {selectedPromo.specialty}
      </h2>

      {modules.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">Aucun module trouvé pour cette promo</p>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((moduleItem) => (
            <ModuleCard
              key={moduleItem.id}
              module={moduleItem}
              showDetails={showDetails === moduleItem.id}
              loading={loading}
              onToggleDetails={() => onToggleDetails(moduleItem.id)}
              onDelete={() => onDeleteClick(moduleItem)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
