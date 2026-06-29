import {
  LuBookOpen,
  LuGraduationCap,
  LuTrash2,
  LuUser,
  LuUserCheck,
  LuUsers,
} from "react-icons/lu";
import type { ModuleWithPromoModules } from "../types";
import { getPromoModulesCount, getRelationsCount } from "../utils";

interface ModuleCardProps {
  module: ModuleWithPromoModules;
  showDetails: boolean;
  loading: boolean;
  onToggleDetails: () => void;
  onDelete: () => void;
}

export function ModuleCard({
  module,
  showDetails,
  loading,
  onToggleDetails,
  onDelete,
}: ModuleCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <LuBookOpen className="h-4 w-4 text-gray-400" />
              {module.name}
            </h3>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {getPromoModulesCount(module)} promo(s)
            </span>
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
              {getRelationsCount(module)} relation(s)
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">ID: {module.id}</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onToggleDetails}
            className="rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-300"
          >
            {showDetails ? "Masquer" : "Détails"}
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            <LuTrash2 className="h-4 w-4" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Details section */}
      {showDetails && module.promoModules && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-md mb-3 font-semibold text-gray-800">
            Données qui seront supprimées :
          </h4>
          <div className="space-y-3">
            {module.promoModules.map((promoModule) => (
              <div key={promoModule.id} className="rounded-md bg-gray-50 p-3">
                <div className="flex items-center gap-2 font-medium text-gray-900">
                  <LuUsers className="h-4 w-4 text-gray-400" />
                  Promo: {promoModule.promo.level} -{" "}
                  {promoModule.promo.specialty} (Charge: {promoModule.workload}
                  h)
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium">Ongoing:</span>
                      <div className="mt-1">
                        {promoModule.ongoing?.length ? (
                          promoModule.ongoing.map((rel, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 text-xs"
                            >
                              <LuGraduationCap className="h-3 w-3 text-green-600" />
                              {rel.teacher.lastname} {rel.teacher.firstname}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400">Aucun</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Potential:</span>
                      <div className="mt-1">
                        {promoModule.potential?.length ? (
                          promoModule.potential.map((rel, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 text-xs"
                            >
                              <LuUser className="h-3 w-3 text-orange-600" />
                              {rel.teacher.lastname} {rel.teacher.firstname}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400">Aucun</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Selected:</span>
                      <div className="mt-1">
                        {promoModule.selected?.length ? (
                          promoModule.selected.map((rel, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 text-xs"
                            >
                              <LuUserCheck className="h-3 w-3 text-purple-600" />
                              {rel.teacher.lastname} {rel.teacher.firstname}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400">Aucun</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
