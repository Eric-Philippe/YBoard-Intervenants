"use client";

import { useState } from "react";
import {
  FaArrowLeft,
  FaTrash,
  FaSpinner,
  FaUserTie,
  FaTimesCircle,
  FaUserPlus,
} from "react-icons/fa";
import { Modal } from "@mantine/core";
import { api } from "~/trpc/react";
import { useAuth } from "~/contexts/AuthContext";
import { getStatusLabel } from "~/lib/utils";
import SubmissionConvertModal from "./SubmissionConvertModal";

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
  moduleLabelSnapshot: string | null;
  promoModules: {
    module: { name: string };
    promo: { level: string; specialty: string };
  } | null;
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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState<{ submissionId: string; teacherId: string; name: string } | null>(null);

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

  const [convertOpen, setConvertOpen] = useState(false);

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
    ["Origine (UTM)", submission.origin ?? "-"],
  ];

  const subjectResponses =
    submission.responses as unknown as SubjectResponseItem[];

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
          onClick={() => setConfirmDeleteOpen(true)}
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

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <FaUserTie className="h-4 w-4 text-blue-500" />
            <h3 className="text-base font-bold text-slate-800">
              Enseignants liés ({teacherLinks?.length ?? 0})
            </h3>
          </div>
          <button
            onClick={() => setConvertOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <FaUserPlus className="h-3.5 w-3.5" />
            Lier / Créer un enseignant
          </button>
        </div>
        {teacherLinks && teacherLinks.length > 0 ? (
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
                        "-"}
                      {link.teacher.status
                        ? ` · ${getStatusLabel(link.teacher.status)}`
                        : ""}
                    </p>
                    <p className="text-xs text-slate-300">
                      Lié le{" "}
                      {new Date(link.linkedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setConfirmUnlink({
                        submissionId: id,
                        teacherId: link.teacher!.id,
                        name: `${link.teacher!.firstname} ${link.teacher!.lastname}`,
                      })
                    }
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
        ) : (
          <p className="px-6 py-4 text-sm text-slate-400">
            Aucun enseignant lié pour le moment.
          </p>
        )}
      </div>

      {convertOpen && (
        <SubmissionConvertModal
          submissionId={id}
          submissionNom={submission.nom}
          submissionPrenom={submission.prenom}
          submissionEmail={submission.email}
          submissionPhone={submission.telephone}
          submissionDiplome={submission.intituleDiplome}
          subjectTitle={
            subjectResponses
              .filter((sr) => sr.response !== "non")
              .map(
                (sr) =>
                  sr.promoModules?.module.name ??
                  sr.moduleLabelSnapshot ??
                  "Module supprimé",
              )
              .join(", ") || "Aucune réponse positive au sondage"
          }
          onClose={() => {
            setConvertOpen(false);
            void refetchLinks();
          }}
        />
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
                    {sr.promoModules
                      ? sr.promoModules.module.name
                      : (sr.moduleLabelSnapshot ?? "Module supprimé")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {sr.promoModules ? (
                      `${sr.promoModules.promo.level} - ${sr.promoModules.promo.specialty}`
                    ) : (
                      <span className="italic">Réponse orpheline (module retiré ou supprimé)</span>
                    )}
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

      <Modal
        opened={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        withCloseButton={false}
        centered
        radius="lg"
        size="sm"
        overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
        classNames={{ content: "!bg-white/90 !backdrop-blur-2xl", body: "p-0" }}
      >
        <div className="p-6">
          <h3 className="mb-2 text-base font-semibold text-gray-900">Supprimer cette entrée</h3>
          <p className="mb-5 text-sm text-gray-500">Cette action est irréversible.</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDeleteOpen(false)} className="btn-secondary flex-1 justify-center">
              Annuler
            </button>
            <button
              onClick={() => { setConfirmDeleteOpen(false); deleteMutation.mutate({ id }); }}
              className="btn-danger flex-1 justify-center"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        opened={!!confirmUnlink}
        onClose={() => setConfirmUnlink(null)}
        withCloseButton={false}
        centered
        radius="lg"
        size="sm"
        overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
        classNames={{ content: "!bg-white/90 !backdrop-blur-2xl", body: "p-0" }}
      >
        {confirmUnlink && (
          <div className="p-6">
            <h3 className="mb-2 text-base font-semibold text-gray-900">Délier l&apos;enseignant</h3>
            <p className="mb-5 text-sm text-gray-500">
              Supprimer le lien avec <strong>{confirmUnlink.name}</strong> ?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmUnlink(null)} className="btn-secondary flex-1 justify-center">
                Annuler
              </button>
              <button
                onClick={() => {
                  unlinkMutation.mutate({ submissionId: confirmUnlink.submissionId, teacherId: confirmUnlink.teacherId });
                  setConfirmUnlink(null);
                }}
                className="btn-danger flex-1 justify-center"
              >
                Délier
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
