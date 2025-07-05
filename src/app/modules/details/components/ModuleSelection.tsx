import type { PromoModule, Promo } from "../types";
import {
  calculateWorkloadStats,
  getWorkloadStatusColor,
  getWorkloadStatusText,
} from "../utils";

interface ModuleSelectionProps {
  selectedPromo: Promo;
  modules: PromoModule[];
  selectedModule: PromoModule | null;
  onModuleSelect: (module: PromoModule) => void;
  isLoading: boolean;
}

export function ModuleSelection({
  selectedPromo,
  modules,
  selectedModule,
  onModuleSelect,
  isLoading,
}: ModuleSelectionProps) {
  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        📖 Étape 2: Sélectionnez un Module ({selectedPromo.level} -{" "}
        {selectedPromo.specialty})
      </h2>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="text-lg">Chargement des modules...</div>
        </div>
      ) : modules.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-sm font-medium text-gray-900">
            Aucun module trouvé
          </h3>
          <p className="text-sm text-gray-500">
            Cette promo n&apos;a pas encore de modules associés
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const stats = calculateWorkloadStats(module);
            return (
              <button
                key={module.id}
                onClick={() => onModuleSelect(module)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  selectedModule?.id === module.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-semibold text-gray-900">
                  📚 {module.module.name}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-gray-600">
                    Volume: {stats.baseWorkload}h
                  </div>
                  <div className="text-sm text-gray-600">
                    Couverture: {stats.coverage}%
                  </div>
                  <div
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getWorkloadStatusColor(stats.coverage)}`}
                  >
                    {getWorkloadStatusText(stats.coverage)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
