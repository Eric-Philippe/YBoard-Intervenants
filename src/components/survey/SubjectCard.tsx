"use client";

import { useState } from "react";
import { FaClock, FaCalendarAlt, FaUsers, FaChevronDown } from "react-icons/fa";
import { useSurvey, type SurveySubject } from "~/contexts/SurveyContext";

export default function SubjectCard({ subject }: { subject: SurveySubject }) {
  const { getSubjectResponse, updateSubjectResponse } = useSurvey();
  const { response, conditionText } = getSubjectResponse(subject.id);
  const [expanded, setExpanded] = useState(false);

  const handleResponse = (val: string) => {
    updateSubjectResponse(subject.id, val, val === "peut_etre" ? conditionText : "");
  };

  const bullets = subject.contenu
    ? subject.contenu.split("\n").filter((l) => l.trim())
    : [];

  return (
    <div
      id={`subject-${subject.id}`}
      className={`rounded-xl border bg-white shadow-sm transition-colors duration-150 scroll-mt-4 ${
        response === "oui"
          ? "border-blue-300 bg-blue-50/40"
          : response === "peut_etre"
            ? "border-amber-300 bg-amber-50/30"
            : "border-gray-200"
      }`}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-bold leading-snug text-slate-800">{subject.title}</h4>

          <div className="mt-2 flex flex-wrap gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <FaClock className="h-3 w-3 text-blue-400" />
              {subject.volumeHoraire}h
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <FaCalendarAlt className="h-3 w-3 text-blue-400" />
              {subject.periode}
            </span>
            {subject.avecMentor && (
              <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                <FaUsers className="h-3 w-3" />
                Avec mentor
              </span>
            )}
          </div>

          {expanded && bullets.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {bullets.map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-300" />
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-row flex-wrap gap-2 sm:flex-shrink-0 sm:flex-nowrap">
          {[
            { value: "oui", label: "Oui", activeClass: "bg-blue-600 text-white border-blue-600 shadow-sm" },
            { value: "non", label: "Non", activeClass: "bg-slate-700 text-white border-slate-700 shadow-sm" },
            { value: "peut_etre", label: "Peut-être", activeClass: "bg-amber-500 text-white border-amber-500 shadow-sm" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleResponse(opt.value)}
              className={`min-w-[84px] rounded-lg border px-3 py-2 text-center text-sm font-semibold transition-all duration-150 ${
                response === opt.value
                  ? opt.activeClass
                  : "border-gray-200 bg-white text-slate-500 hover:border-gray-300 hover:text-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {response === "peut_etre" && (
        <div className="border-t border-amber-200 px-5 pt-4 pb-3">
          <label className="mb-1.5 block text-sm font-semibold text-amber-700">
            Précisez les conditions dans lesquelles vous pourriez intervenir
          </label>
          <textarea
            value={conditionText}
            onChange={(e) => updateSubjectResponse(subject.id, "peut_etre", e.target.value)}
            placeholder="Par exemple : uniquement en soirée, sous réserve de disponibilité..."
            rows={2}
            className="w-full resize-none rounded-lg border border-amber-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      )}

      {bullets.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-2 text-center">
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FaChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
            {expanded ? "Masquer les objectifs" : "Voir les objectifs pédagogiques"}
          </button>
        </div>
      )}
    </div>
  );
}
