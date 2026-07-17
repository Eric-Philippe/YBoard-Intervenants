"use client";

import { use, useState } from "react";
import {
  FaChartBar,
  FaList,
  FaBook,
  FaLink,
  FaClipboard,
} from "react-icons/fa";
import { api } from "~/trpc/react";
import StatsPanel from "~/components/surveyAdmin/StatsPanel";
import SubmissionList from "~/components/surveyAdmin/SubmissionList";
import SubjectView from "~/components/surveyAdmin/SubjectView";
import type { SurveyCategory } from "~/contexts/SurveyContext";

const TABS = [
  { id: "stats", label: "Tableau de bord", icon: FaChartBar },
  { id: "submissions", label: "Reponses", icon: FaList },
  { id: "subjects", label: "Par matiere", icon: FaBook },
  { id: "links", label: "Liens UTM", icon: FaLink },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SondageAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [tab, setTab] = useState<TabId>("stats");

  const { data: configData } = api.survey.getConfig.useQuery({ slug });
  const categories = (configData?.categories ?? []) as SurveyCategory[];
  const perimeterId = configData?.perimeter.id;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const surveyUrl = `${baseUrl}/sondage/${slug}`;

  if (!perimeterId) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <span className="text-xs font-semibold tracking-wider text-brand-600 uppercase">
          Questionnaire
        </span>
        <h1 className="text-lg font-bold text-slate-800">
          Administration · {configData?.perimeter.title}
        </h1>
      </div>

      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        {/* Tab navigation */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                tab === id
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-gray-50 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "stats" && <StatsPanel perimeterId={perimeterId} />}

        {tab === "submissions" && (
          <SubmissionList
            perimeterId={perimeterId}
            perimeterSlug={slug}
            categories={categories}
          />
        )}

        {tab === "subjects" && (
          <SubjectView perimeterId={perimeterId} categories={categories} />
        )}

        {tab === "links" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-base font-bold text-slate-800">
                Liens avec tracking UTM
              </h2>
              <p className="mb-4 text-sm text-slate-500">
                Utilisez ces liens pour suivre l&apos;origine des candidatures.
                La source UTM est enregistree avec chaque reponse.
              </p>
              <div className="space-y-3">
                {[
                  "linkedin",
                  "email",
                  "site-web",
                  "teams",
                  "qrcode",
                  "partenaire",
                ].map((source) => {
                  const url = `${surveyUrl}?utm_source=${source}`;
                  return (
                    <div
                      key={source}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <code className="flex-1 truncate text-sm text-brand-700">
                        {url}
                      </code>
                      <button
                        onClick={() => void navigator.clipboard.writeText(url)}
                        className="flex-shrink-0 rounded-md border border-gray-200 bg-white p-1.5 text-slate-400 transition-colors hover:text-brand-600"
                        title="Copier"
                      >
                        <FaClipboard className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <span className="text-sm font-medium text-slate-500">
                  Lien public du questionnaire :
                </span>
                <a
                  href={surveyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-sm text-brand-600 hover:underline"
                >
                  {surveyUrl}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
