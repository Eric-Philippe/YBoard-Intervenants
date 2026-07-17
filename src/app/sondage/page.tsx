"use client";

import { redirect } from "next/navigation";
import Link from "next/link";
import { IconClipboardList, IconArrowRight } from "@tabler/icons-react";
import { api } from "~/trpc/react";

const ENABLE_SONDAGE = process.env.NEXT_PUBLIC_ENABLE_SONDAGE !== "false";

export default function SondageHubPage() {
  if (!ENABLE_SONDAGE) {
    redirect("/");
  }

  const { data, isLoading } = api.survey.getHub.useQuery();
  const perimeters = data?.perimeters ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
          <span className="text-xs font-bold tracking-widest text-brand-600 uppercase">
            YLab
          </span>
          <h1 className="flex items-center gap-2 text-xl leading-tight font-bold text-slate-800">
            <IconClipboardList size={22} className="text-brand-600" />
            Questionnaires disponibles
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Choisissez le questionnaire correspondant au perimetre pour lequel vous candidatez.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="text-center text-sm text-slate-400">Chargement...</div>
        ) : perimeters.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Aucun questionnaire disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perimeters.map((p) => (
              <Link
                key={p.id}
                href={`/sondage/${p.slug}`}
                className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="font-semibold text-slate-800">{p.title}</span>
                </div>
                <IconArrowRight
                  size={18}
                  className="text-slate-300 transition-colors group-hover:text-brand-600"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
