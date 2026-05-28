"use client";

import {
  FaArrowLeft,
  FaTrash,
  FaSpinner,
  FaUserTie,
  FaTimesCircle,
} from "react-icons/fa";
import { api } from "~/trpc/react";
import { useAuth } from "~/contexts/AuthContext";

const niveauLabels: Record<string, string> = {
  bac3: "Bac+3",
  bac5: "Bac+5",
  bac8: "Bac+8",
  autre: "Autre",
};

const responseLabels: Record<string, string> = {
  oui: "Oui",
  peut_etre: "Peut-être",
  non: "Non",
};

type SubjectResponseItem = {
  id: string;
  response: string;
  conditionText: string | null;
  subject: { title: string; category: { label: string } };
};

export default function SubmissionDetail({
  id,
  onBack,
  onDeleted,
}: {
  id: string;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const { isAuthenticated } = useAuth();

  const { data: submission, isLoading } =
    api.surveyAdmin.getSubmission.useQuery(
      { id },
      { enabled: isAuthenticated },
    );

  const deleteMutation = api.surveyAdmin.deleteSubmission.useMutation({
    onSuccess: () => {
      onDeleted();
      onBack();
    },
  });

  const { data: teacherLinks, refetch: refetchLinks } =
    api.surveyAdmin.getSubmissionTeacherLinks.useQuery(
      { submissionId: id },
      { enabled: isAuthenticated },
    );

  const unlinkMutation = api.surveyAdmin.unlinkTeacher.useMutation({
    onSuccess: () => void refetchLinks(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-slate-500 shadow-sm">
        Réponse introuvable.
      </div>
    );
  }

  const rows: [string, string][] = [
    ["Nom", submission.nom],
    ["Prénom", submission.prenom],
    ["Email", submission.email],
    ["Téléphone", submission.telephone],
    [
      "Niveau académique",
      niveauLabels[submission.niveauAcademique] ?? submission.niveauAcademique,
    ],
    ["Diplôme / Titre", submission.intituleDiplome],
    ["Années d'expérience", submission.anneesExperience],
    ["Domaines d'exercice", submission.domainesExercice],
    ["Projets personnels", submission.projetsPersonnels],
    ["Lien profil", submission.lienProfil],
    ["Remarques", submission.remarques],
    ["Choix final", submission.finalChoice],
    ["Origine (UTM)", submission.origin ?? "—"],
  ];

  const subjectResponses =
    submission.subjectResponses as unknown as SubjectResponseItem[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <FaArrowLeft className="h-3.5 w-3.5" />
          Retour à la liste
        </button>
        <button
          onClick={() => {
            if (window.confirm("Supprimer cette entrée ?")) {
              deleteMutation.mutate({ id });
            }
          }}
          disabled={deleteMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
        >
          {deleteMutation.isPending ? (
            <FaSpinner className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FaTrash className="h-3.5 w-3.5" />
          )}
          Supprimer
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">
            {submission.prenom} {submission.nom}
          </h3>
          <p className="text-xs text-slate-400">
            Soumis le {new Date(submission.createdAt).toLocaleString("fr-FR")}
          </p>
        </div>
        <dl className="divide-y divide-gray-50">
          {rows.map(([label, value]) =>
            value ? (
              <div key={label} className="grid grid-cols-3 gap-4 px-6 py-3">
                <dt className="text-sm font-semibold text-slate-500">
                  {label}
                </dt>
                <dd className="col-span-2 text-sm break-words text-slate-800">
                  {value}
                </dd>
              </div>
            ) : null,
          )}
        </dl>
      </div>

      {teacherLinks && teacherLinks.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
            <FaUserTie className="h-4 w-4 text-blue-500" />
            <h3 className="text-base font-bold text-slate-800">
              Enseignants liés ({teacherLinks.length})
            </h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {teacherLinks.map((link) =>
              link.teacher ? (
                <li
                  key={link.linkId}
                  className="flex items-center justify-between gap-4 px-6 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {link.teacher.firstname} {link.teacher.lastname}
                    </p>
                    <p className="text-xs text-slate-400">
                      {link.teacher.email_perso ??
                        link.teacher.email_ynov ??
                        "—"}
                      {link.teacher.status ? ` · ${link.teacher.status}` : ""}
                    </p>
                    <p className="text-xs text-slate-300">
                      Lié le{" "}
                      {new Date(link.linkedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Supprimer le lien avec ${link.teacher!.firstname} ${link.teacher!.lastname} ?`,
                        )
                      ) {
                        unlinkMutation.mutate({
                          submissionId: id,
                          teacherId: link.teacher!.id,
                        });
                      }
                    }}
                    disabled={unlinkMutation.isPending}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <FaTimesCircle className="h-3 w-3" />
                    Délier
                  </button>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      )}

      {subjectResponses.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-bold text-slate-800">
              Réponses aux matières ({subjectResponses.length})
            </h3>
          </div>
          <ul className="divide-y divide-gray-50">
            {subjectResponses.map((sr) => (
              <li
                key={sr.id}
                className="flex items-start justify-between gap-4 px-6 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {sr.subject.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {sr.subject.category.label}
                  </p>
                  {sr.conditionText && (
                    <p className="mt-0.5 text-xs text-slate-500 italic">
                      {sr.conditionText}
                    </p>
                  )}
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    sr.response === "oui"
                      ? "bg-blue-100 text-blue-700"
                      : sr.response === "peut_etre"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {responseLabels[sr.response] ?? sr.response}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
