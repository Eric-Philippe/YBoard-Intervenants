"use client";

import { FaUsers, FaLink, FaChartBar } from "react-icons/fa";
import { api } from "~/trpc/react";
import { useAuth } from "~/contexts/AuthContext";

type StatEntry = { count: number };
type OriginEntry = StatEntry & { origin: string };
type ChoiceEntry = StatEntry & { choice: string };

const choiceLabels: Record<string, string> = {
  oui: "Choix effectué",
  oui_recontacte: "Souhaite être recontacté",
  non_recontacte: "Souhaite être recontacté (Pas Intervenant)",
  non_sans_suite: "Pas de suite",
  "": "Non renseigné",
};

export default function StatsPanel() {
  const { isAuthenticated } = useAuth();
  const { data: stats, isLoading } = api.surveyAdmin.getStats.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    },
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-3 h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-8 w-1/3 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-lg bg-blue-100 p-2">
              <FaUsers className="h-5 w-5 text-blue-600" />
            </span>
            <p className="text-sm font-medium text-slate-500">Total réponses</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {stats.totalSubmissions}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-lg bg-blue-100 p-2">
              <FaLink className="h-5 w-5 text-blue-600" />
            </span>
            <p className="text-sm font-medium text-slate-500">
              Sources d&apos;origine
            </p>
          </div>
          {stats.origins.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune donnée</p>
          ) : (
            <ul className="space-y-1.5">
              {(stats.origins as OriginEntry[]).map((o, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate text-slate-600">{o.origin}</span>
                  <span className="ml-3 font-semibold text-slate-800">
                    {o.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="rounded-lg bg-blue-100 p-2">
              <FaChartBar className="h-5 w-5 text-blue-600" />
            </span>
            <p className="text-sm font-medium text-slate-500">Choix finaux</p>
          </div>
          {stats.finalChoices.length === 0 ? (
            <p className="text-sm text-slate-400">Aucune donnée</p>
          ) : (
            <ul className="space-y-1.5">
              {(stats.finalChoices as ChoiceEntry[]).map((c, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate text-slate-600">
                    {choiceLabels[c.choice] ?? c.choice}
                  </span>
                  <span className="ml-3 font-semibold text-slate-800">
                    {c.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
