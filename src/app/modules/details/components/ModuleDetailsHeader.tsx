import type { PromoModule, WorkloadStats } from "../types";
import { getWorkloadStatusColor, getWorkloadStatusText } from "../utils";

interface ModuleDetailsHeaderProps {
  selectedModule: PromoModule;
  stats: WorkloadStats;
}

export function ModuleDetailsHeader({
  selectedModule,
  stats,
}: ModuleDetailsHeaderProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Informations Générales
          </h3>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Nom du Module
              </dt>
              <dd className="text-sm text-gray-900">
                {selectedModule.module.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Promo</dt>
              <dd className="text-sm text-gray-900">
                {selectedModule.promo.level} - {selectedModule.promo.specialty}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ID Module</dt>
              <dd className="font-mono text-sm text-gray-900">
                {selectedModule.module.id}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Volume Horaire</h3>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Volume de base
              </dt>
              <dd className="text-lg font-semibold text-blue-600">
                {stats.baseWorkload}h
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Total assigné (Selected)
              </dt>
              <dd className="text-lg font-semibold text-green-600">
                {stats.totalAssigned}h
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Heures restantes
              </dt>
              <dd
                className={`text-lg font-semibold ${stats.remaining > 0 ? "text-orange-600" : "text-green-600"}`}
              >
                {stats.remaining}h
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Statistiques de Charge
          </h3>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Taux de couverture (Selected)
              </dt>
              <dd className="text-lg font-semibold text-purple-600">
                {stats.coverage}%
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Statut</dt>
              <dd>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getWorkloadStatusColor(stats.coverage)}`}
                >
                  {getWorkloadStatusText(stats.coverage)}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">
            💰 Informations Financières
          </h3>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Coût Selected
              </dt>
              <dd className="text-lg font-semibold text-green-600">
                {stats.totalSelectedCost}€
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Taux moyen Selected
              </dt>
              <dd className="text-sm font-medium text-gray-900">
                {stats.averageSelectedRate > 0
                  ? `${stats.averageSelectedRate}€/h`
                  : "N/A"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
