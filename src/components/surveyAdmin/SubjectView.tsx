"use client";

import { useState } from "react";
import {
  FaUsers,
  FaInbox,
  FaChevronDown,
  FaChevronRight,
  FaUserCheck,
  FaEye,
} from "react-icons/fa";
import { api } from "~/trpc/react";
import { useAuth } from "~/contexts/AuthContext";
import type { SurveyCategory } from "~/contexts/SurveyContext";
import { getCatIcon } from "~/utils/categoryIcons";
import SubmissionConvertModal from "./SubmissionConvertModal";
import SubmissionDetail from "./SubmissionDetail";

const niveauLabels: Record<string, string> = {
  bac3: "Bac+3",
  bac5: "Bac+5",
  bac8: "Bac+8",
  autre: "Autre",
};

type Responder = {
  submission_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  intituleDiplome: string;
  niveauAcademique: string;
  response: string;
  condition_text: string | null;
};

type ConvertTarget = {
  submissionId: string;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  diplome: string;
  subjectTitle: string;
};

function SubjectResponders({
  subjectId,
  subjectTitle,
  onConvert,
  onViewSubmission,
}: {
  subjectId: string;
  subjectTitle: string;
  onConvert: (target: ConvertTarget) => void;
  onViewSubmission: (submissionId: string) => void;
}) {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = api.surveyAdmin.getSubjectResponses.useQuery(
    { promoModulesId: subjectId },
    { enabled: isAuthenticated },
  );

  if (isLoading)
    return (
      <div className="py-3 text-center text-xs text-slate-400">
        Chargement...
      </div>
    );
  if (!data || data.responders.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-slate-400">
        Aucun intervenant disponible.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-50">
      {(data.responders as Responder[]).map((r, i) => (
        <li
          key={i}
          className="flex items-start justify-between gap-3 px-4 py-2.5"
        >
          <button
            onClick={() => onViewSubmission(r.submission_id)}
            className="min-w-0 flex-1 text-left transition-opacity hover:opacity-75"
          >
            <p className="text-sm font-medium text-slate-800">
              {r.prenom} {r.nom}
            </p>
            <p className="text-xs text-slate-400">
              {r.email} ·{" "}
              {niveauLabels[r.niveauAcademique] ?? r.niveauAcademique}
            </p>
            {r.condition_text && (
              <p className="mt-0.5 text-xs text-slate-500 italic">
                {r.condition_text}
              </p>
            )}
          </button>
          <div className="flex flex-shrink-0 items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                r.response === "oui"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {r.response === "oui" ? "Oui" : "Peut-être"}
            </span>
            <button
              onClick={() => onViewSubmission(r.submission_id)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:bg-gray-50 hover:text-slate-700"
              title="Voir la réponse complète"
            >
              <FaEye className="h-3 w-3" />
              Voir
            </button>
            <button
              onClick={() =>
                onConvert({
                  submissionId: r.submission_id,
                  nom: r.nom,
                  prenom: r.prenom,
                  email: r.email,
                  phone: r.telephone,
                  diplome: r.intituleDiplome,
                  subjectTitle,
                })
              }
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              title="Convertir en enseignant et lier à un module"
            >
              <FaUserCheck className="h-3 w-3" />
              Valider
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SubjectRow({
  subject,
  ouiCount,
  peutEtreCount,
  onConvert,
  onViewSubmission,
}: {
  subject: SurveyCategory["subjects"][number];
  ouiCount: number;
  peutEtreCount: number;
  onConvert: (target: ConvertTarget) => void;
  onViewSubmission: (submissionId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const total = ouiCount + peutEtreCount;

  return (
    <div className="border-t border-gray-50 first:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800">{subject.title}</p>
          <p className="text-xs text-slate-400">{subject.volumeHoraire}h</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {ouiCount > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {ouiCount} Oui
            </span>
          )}
          {peutEtreCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              {peutEtreCount} Peut-être
            </span>
          )}
          {total === 0 && (
            <span className="text-xs text-slate-300">Aucune réponse</span>
          )}
          {total > 0 &&
            (open ? (
              <FaChevronDown className="h-3 w-3 text-slate-400" />
            ) : (
              <FaChevronRight className="h-3 w-3 text-slate-400" />
            ))}
        </div>
      </button>
      {open && total > 0 && (
        <div className="bg-gray-50/60">
          <SubjectResponders
            subjectId={subject.id}
            subjectTitle={subject.title}
            onConvert={onConvert}
            onViewSubmission={onViewSubmission}
          />
        </div>
      )}
    </div>
  );
}

export default function SubjectView({
  perimeterId,
  categories,
}: {
  perimeterId: string;
  categories: SurveyCategory[];
}) {
  const { isAuthenticated } = useAuth();
  const [convertTarget, setConvertTarget] = useState<ConvertTarget | null>(
    null,
  );
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);

  const { data: subjectStats } = api.surveyAdmin.getSubjectStats.useQuery(
    { perimeterId },
    {
      enabled: isAuthenticated,
    },
  );

  if (selectedSubmissionId) {
    return (
      <SubmissionDetail
        id={selectedSubmissionId}
        onBack={() => setSelectedSubmissionId(null)}
        onDeleted={() => setSelectedSubmissionId(null)}
      />
    );
  }

  const statsMap = new Map((subjectStats ?? []).map((s) => [s.subject_id, s]));

  return (
    <>
      <div className="space-y-4">
        {categories.map((cat) => {
          const { Icon: CatIcon, color: iconColor } = getCatIcon(cat);
          return (
            <div
              key={cat.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${iconColor}18`,
                    color: iconColor,
                  }}
                >
                  <CatIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {cat.subjects.length} matière
                    {cat.subjects.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <FaUsers className="h-3 w-3" /> Disponibilités
                  </span>
                  <span className="flex items-center gap-1">
                    <FaInbox className="h-3 w-3" /> Cliquer pour voir
                  </span>
                </div>
              </div>
              <div>
                {cat.subjects.map((subj) => {
                  const stats = statsMap.get(subj.id);
                  return (
                    <SubjectRow
                      key={subj.id}
                      subject={subj}
                      ouiCount={stats?.oui ?? 0}
                      peutEtreCount={stats?.peut_etre ?? 0}
                      onConvert={setConvertTarget}
                      onViewSubmission={setSelectedSubmissionId}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {convertTarget && (
        <SubmissionConvertModal
          submissionId={convertTarget.submissionId}
          submissionNom={convertTarget.nom}
          submissionPrenom={convertTarget.prenom}
          submissionEmail={convertTarget.email}
          submissionPhone={convertTarget.phone}
          submissionDiplome={convertTarget.diplome}
          subjectTitle={convertTarget.subjectTitle}
          onClose={() => setConvertTarget(null)}
        />
      )}
    </>
  );
}
