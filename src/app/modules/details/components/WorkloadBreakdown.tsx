import type { WorkloadStats } from "../types";

interface WorkloadBreakdownProps {
  stats: WorkloadStats;
}

export function WorkloadBreakdown({ stats }: WorkloadBreakdownProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        📈 Répartition des Charges
      </h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <dt className="text-sm font-medium text-blue-700">Volume Total</dt>
          <dd className="text-2xl font-bold text-blue-900">
            {stats.baseWorkload}h
          </dd>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <dt className="text-sm font-medium text-green-700">
            Ongoing (Année passée)
          </dt>
          <dd className="text-2xl font-bold text-green-900">
            {stats.ongoingTotal}h
          </dd>
          <div className="mt-1 text-xs text-green-600">
            {stats.ongoingTotal > 0
              ? "100% du workload passé"
              : "Aucun historique"}
          </div>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <dt className="text-sm font-medium text-orange-700">
            Potential (Candidats)
          </dt>
          <dd className="text-2xl font-bold text-orange-900">
            {stats.potentialTotal}h
          </dd>
          <div className="mt-1 text-xs text-orange-600">
            Ne compte pas dans l&apos;allocation
          </div>
        </div>
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <dt className="text-sm font-medium text-purple-700">
            Selected (Alloué)
          </dt>
          <dd className="text-2xl font-bold text-purple-900">
            {stats.selectedTotal}h
          </dd>
          <div className="mt-1 text-xs text-purple-600">
            Base du calcul d&apos;allocation
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Progression de l&apos;allocation
          </span>
          <span className="text-sm text-gray-500">{stats.coverage}%</span>
        </div>
        <div className="mt-2 h-3 w-full rounded-full bg-gray-200">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              stats.coverage <= 100 ? "bg-green-500" : "bg-red-500"
            }`}
            style={{
              width: `${Math.min(stats.coverage, 100)}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
