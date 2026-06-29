import { useState } from "react";
import { LuBookOpen, LuLayers, LuSearch, LuSearchX, LuX } from "react-icons/lu";
import type { PromoModule, Promo } from "../types";
import {
  calculateWorkloadStats,
  getWorkloadStatusColor,
  getWorkloadStatusText,
} from "../utils";
import { CoverageBar, RelationsHoverPreview } from "~/components";

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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredModules = modules.filter((module) =>
    module.module.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="mb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <LuBookOpen className="h-5 w-5 text-green-600" />
          Sélectionnez un Module ({selectedPromo.level} -{" "}
          {selectedPromo.specialty})
        </h2>
        {modules.length > 0 && (
          <div className="relative w-full max-w-xs sm:w-64">
            <input
              type="text"
              placeholder="Rechercher un module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-1.5 pr-8 pl-9 text-sm focus:border-green-500 focus:ring-green-500"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
              <LuSearch className="h-4 w-4 text-gray-400" />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5"
              >
                <LuX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="text-lg">Chargement des modules...</div>
        </div>
      ) : modules.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <LuLayers className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mb-2 text-sm font-medium text-gray-900">
            Aucun module trouvé
          </h3>
          <p className="text-sm text-gray-500">
            Cette promo n&apos;a pas encore de modules associés
          </p>
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <LuSearchX className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mb-2 text-sm font-medium text-gray-900">
            Aucun module trouvé pour &quot;{searchTerm}&quot;
          </h3>
          <button
            onClick={() => setSearchTerm("")}
            className="text-sm text-green-600 hover:text-green-800"
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredModules.map((module) => {
            const stats = calculateWorkloadStats(module);
            const isSelected = selectedModule?.id === module.id;
            return (
              <button
                key={module.id}
                onClick={() => onModuleSelect(module)}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  isSelected
                    ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-semibold text-gray-900">
                    <LuBookOpen className="h-4 w-4 shrink-0 text-gray-400" />
                    {module.module.name}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getWorkloadStatusColor(stats.coverage)}`}
                  >
                    {getWorkloadStatusText(stats.coverage)}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="text-sm text-gray-600">
                    Volume: {stats.baseWorkload}h
                  </div>
                  <RelationsHoverPreview
                    ongoing={module.ongoing}
                    potential={module.potential}
                    selected={module.selected}
                    className="block w-full"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-full">
                        <CoverageBar coverage={stats.coverage} size="sm" />
                      </div>
                      <span className="shrink-0 text-xs font-medium text-gray-500">
                        {stats.coverage}%
                      </span>
                    </div>
                  </RelationsHoverPreview>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
