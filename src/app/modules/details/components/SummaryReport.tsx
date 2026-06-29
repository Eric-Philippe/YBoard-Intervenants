import { LuClipboardList, LuCoins } from "react-icons/lu";
import type { PromoModule, WorkloadStats } from "../types";

interface SummaryReportProps {
  selectedModule: PromoModule;
  stats: WorkloadStats;
}

export function SummaryReport({ selectedModule, stats }: SummaryReportProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
        <LuClipboardList className="h-5 w-5 text-blue-600" />
        Rapport de Synthèse
      </h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div>
          <h4 className="mb-2 font-medium text-gray-800">
            Allocation des Ressources
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>
              • Volume total du module: <strong>{stats.baseWorkload}h</strong>
            </li>
            <li>
              • Heures allouées (Selected):{" "}
              <strong>{stats.totalAssigned}h</strong>
            </li>
            <li>
              • Taux de couverture: <strong>{stats.coverage}%</strong>
            </li>
            <li>
              • Heures restantes: <strong>{stats.remaining}h</strong>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-medium text-gray-800">
            Répartition par Statut
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>
              • Ongoing: <strong>{stats.ongoingTotal}h</strong> (
              {selectedModule.ongoing?.length ?? 0} enseignant
              {(selectedModule.ongoing?.length ?? 0) > 1 ? "s" : ""}) -{" "}
              <em className="text-green-600">Historique année passée</em>
            </li>
            <li>
              • Potential: <strong>{stats.potentialTotal}h</strong> (
              {selectedModule.potential?.length ?? 0} enseignant
              {(selectedModule.potential?.length ?? 0) > 1 ? "s" : ""}) -{" "}
              <em className="text-orange-600">Candidats multiples</em>
            </li>
            <li>
              • Selected: <strong>{stats.selectedTotal}h</strong> (
              {selectedModule.selected?.length ?? 0} enseignant
              {(selectedModule.selected?.length ?? 0) > 1 ? "s" : ""}) -{" "}
              <em className="text-purple-600">Allocation effective</em>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-800">
            <LuCoins className="h-4 w-4 text-amber-600" />
            Informations Financières
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>
              • Coût Ongoing: <strong>{stats.ongoingCost}€</strong>
              {stats.averageOngoingRate > 0 && (
                <span className="text-xs text-gray-500">
                  {" "}
                  (Moy: {stats.averageOngoingRate}€/h)
                </span>
              )}
            </li>
            <li>
              • Coût Selected:{" "}
              <strong className="text-green-600">{stats.selectedCost}€</strong>
              {stats.averageSelectedRate > 0 && (
                <span className="text-xs text-gray-500">
                  {" "}
                  (Moy: {stats.averageSelectedRate}€/h)
                </span>
              )}
            </li>
          </ul>
        </div>
      </div>

      {stats.coverage < 100 && (
        <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Attention: Allocation incomplète (Selected)
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Il reste <strong>{stats.remaining}h</strong> à allouer en
                  statut &quot;Selected&quot; pour couvrir complètement ce
                  module.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {stats.coverage > 100 && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Attention: Sur-allocation détectée (Selected)
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Ce module est sur-alloué de{" "}
                  <strong>{stats.totalAssigned - stats.baseWorkload}h</strong>{" "}
                  en statut &quot;Selected&quot;. Vérifiez les assignations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
