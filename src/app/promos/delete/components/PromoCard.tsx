import type { PromoWithModules } from "../types";
import { getPromoModulesCount, getRelationsCount } from "../utils";
import { IconTrash, IconBook, IconUser, IconCheck } from "@tabler/icons-react";

interface PromoCardProps {
  promo: PromoWithModules;
  showDetails: boolean;
  onToggleDetails: () => void;
  onDeleteClick: () => void;
  loading: boolean;
}

export function PromoCard({
  promo,
  showDetails,
  onToggleDetails,
  onDeleteClick,
  loading,
}: PromoCardProps) {
  return (
    <div className="glass-panel surface-hover rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {promo.level} - {promo.specialty}
            </h3>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {getPromoModulesCount(promo)} module(s)
            </span>
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
              {getRelationsCount(promo)} relation(s)
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">ID: {promo.id}</p>
        </div>

        <div className="flex space-x-2">
          <button onClick={onToggleDetails} className="btn-glass">
            {showDetails ? "Masquer" : "Détails"}
          </button>
          <button
            onClick={onDeleteClick}
            className="btn-danger"
            disabled={loading}
          >
            <IconTrash size={16} />
            Supprimer
          </button>
        </div>
      </div>

      {/* Details section */}
      {showDetails && promo.promoModules && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-md mb-3 font-semibold text-gray-800">
            Données qui seront supprimées :
          </h4>
          <div className="space-y-3">
            {promo.promoModules.map((promoModule) => (
              <div key={promoModule.id} className="rounded-md bg-gray-50 p-3">
                <div className="flex items-center gap-2 font-medium text-gray-900">
                  <IconBook size={16} />
                  Module : {promoModule.module.name} (Charge:{" "}
                  {promoModule.workload}h)
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
                              <IconUser size={12} />
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
                              <IconUser size={12} />
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
                              <IconCheck size={12} />
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
