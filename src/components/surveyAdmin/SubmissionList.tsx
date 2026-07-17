"use client";

import { useState, useCallback } from "react";
import {
  FaSearch,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaSpinner,
} from "react-icons/fa";
import { api } from "~/trpc/react";
import { useAuth } from "~/contexts/AuthContext";
import type { SurveyCategory } from "~/contexts/SurveyContext";
import SubmissionDetail from "./SubmissionDetail";

const niveauLabels: Record<string, string> = {
  bac3: "Bac+3",
  bac5: "Bac+5",
  bac8: "Bac+8",
  autre: "Autre",
};

const choiceLabels: Record<string, string> = {
  oui: "Choix effectué",
  oui_recontacte: "À recontacter",
  non_recontacte: "À recontacter (Pas intervenant)",
  non_sans_suite: "Sans suite",
};

export default function SubmissionList({
  perimeterId,
  perimeterSlug,
  categories,
}: {
  perimeterId: string;
  perimeterSlug: string;
  categories: SurveyCategory[];
}) {
  const { token, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [responseFilter, setResponseFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const LIMIT = 20;

  const { data, isLoading, refetch } = api.surveyAdmin.listSubmissions.useQuery(
    {
      perimeterId,
      page,
      limit: LIMIT,
      search: search || undefined,
      promoId: categoryFilter || undefined,
      response: responseFilter || undefined,
    },
    { enabled: isAuthenticated },
  );

  const submissions = data?.submissions ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ perimeter: perimeterSlug });
      if (categoryFilter) params.set("promo", categoryFilter);
      const res = await fetch(`/api/sondage/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [categoryFilter, token, perimeterSlug]);

  if (selectedId) {
    return (
      <SubmissionDetail
        id={selectedId}
        onBack={() => setSelectedId(null)}
        onDeleted={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher par nom, prénom ou email..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pr-3 pl-9 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Rechercher
          </button>
        </form>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {exporting ? (
            <FaSpinner className="h-4 w-4 animate-spin" />
          ) : (
            <FaDownload className="h-4 w-4" />
          )}
          Exporter CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={responseFilter}
          onChange={(e) => {
            setResponseFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Tous les types de réponse</option>
          <option value="oui">Oui</option>
          <option value="peut_etre">Peut-être</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <FaSpinner className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-800">{total}</span>{" "}
                réponse{total > 1 ? "s" : ""}
              </p>
            </div>
            {submissions.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-400">
                Aucune réponse trouvée.
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {submissions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {s.prenom} {s.nom}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {s.email}
                      </p>
                    </div>
                    <div className="hidden flex-shrink-0 gap-2 sm:flex">
                      {s.niveauAcademique && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          {niveauLabels[s.niveauAcademique] ??
                            s.niveauAcademique}
                        </span>
                      )}
                      {s.finalChoice && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {choiceLabels[s.finalChoice] ?? s.finalChoice}
                        </span>
                      )}
                    </div>
                    <p className="hidden flex-shrink-0 text-xs text-slate-400 sm:block">
                      {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      className="flex-shrink-0 rounded-lg border border-gray-200 p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <FaEye className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                <FaChevronLeft className="h-3 w-3" />
                Précédent
              </button>
              <span className="text-sm text-slate-500">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                Suivant
                <FaChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
