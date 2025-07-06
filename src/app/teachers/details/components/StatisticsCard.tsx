import type { TeacherStatistics } from "../types";

interface StatisticsCardProps {
  statistics: TeacherStatistics;
}

export function StatisticsCard({ statistics }: StatisticsCardProps) {
  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        📊 Statistiques
      </h2>
      <dl className="space-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">
            Relations totales
          </dt>
          <dd className="mt-1 text-2xl font-bold text-gray-900">
            {statistics.totalRelations}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">
            Charge de travail totale
          </dt>
          <dd className="mt-1 text-2xl font-bold text-blue-600">
            {statistics.selectedWorkload}h
          </dd>
        </div>
        {statistics.selectedCost > 0 && (
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Coût total estimé (Selected)
            </dt>
            <dd className="mt-1 text-2xl font-bold text-green-600">
              {statistics.selectedCost.toFixed(2)}€
            </dd>
          </div>
        )}
        <div className="grid grid-cols-3 gap-4 pt-4 text-center">
          <div>
            <dt className="text-xs font-medium text-green-600">Ongoing</dt>
            <dd className="mt-1 text-lg font-semibold text-green-800">
              {statistics.ongoingWorkload}h
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-orange-600">Potential</dt>
            <dd className="mt-1 text-lg font-semibold text-orange-800">
              {statistics.potentialWorkload}h
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-blue-600">Selected</dt>
            <dd className="mt-1 text-lg font-semibold text-blue-800">
              {statistics.selectedWorkload}h
            </dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
