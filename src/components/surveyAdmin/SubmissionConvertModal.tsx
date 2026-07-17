"use client";

import { useState } from "react";
import {
  FaTimes,
  FaUserPlus,
  FaLink,
  FaSearch,
  FaCheck,
  FaArrowRight,
} from "react-icons/fa";
import { api } from "~/trpc/react";
import { getStatusLabel } from "~/lib/utils";

type Props = {
  submissionId: string;
  submissionNom: string;
  submissionPrenom: string;
  submissionEmail: string;
  submissionPhone: string;
  submissionDiplome: string;
  subjectTitle: string;
  onClose: () => void;
};

type Step = "teacher" | "module" | "done";
type Tab = "link" | "create";

type TeacherResult = {
  id: string;
  firstname: string;
  lastname: string;
  email_perso?: string | null;
  status?: string | null;
};

function TeacherLinkStep({
  submissionId,
  submissionNom,
  submissionPrenom,
  submissionEmail,
  submissionPhone,
  submissionDiplome,
  onLinked,
}: {
  submissionId: string;
  submissionNom: string;
  submissionPrenom: string;
  submissionEmail: string;
  submissionPhone: string;
  submissionDiplome: string;
  onLinked: (
    teacherId: string,
    teacherName: string,
    potentialCount: number,
  ) => void;
}) {
  const [tab, setTab] = useState<Tab>("link");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    firstname: submissionPrenom,
    lastname: submissionNom,
    email_perso: submissionEmail,
    phone_number: submissionPhone,
    diploma: submissionDiplome,
    status: "",
    email_ynov: "",
    rate: "",
  });
  const [error, setError] = useState("");

  const { data: teachers } = api.teachers.getAll.useQuery();
  const linkMut = api.surveyAdmin.linkToExistingTeacher.useMutation();
  const createMut = api.surveyAdmin.createAndLinkTeacher.useMutation();

  const filtered = (teachers ?? []).filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.lastname.toLowerCase().includes(q) ||
      t.firstname.toLowerCase().includes(q) ||
      (t.email_perso ?? "").toLowerCase().includes(q)
    );
  }) as TeacherResult[];

  const handleLink = async (teacher: TeacherResult) => {
    setError("");
    try {
      const result = await linkMut.mutateAsync({
        submissionId,
        teacherId: teacher.id,
      });
      onLinked(
        teacher.id,
        `${teacher.firstname} ${teacher.lastname}`,
        result.potentialCount,
      );
    } catch {
      setError("Erreur lors de la liaison.");
    }
  };

  const handleCreate = async () => {
    setError("");
    if (!form.firstname || !form.lastname) {
      setError("Le prénom et le nom sont requis.");
      return;
    }
    try {
      const teacher = await createMut.mutateAsync({
        submissionId,
        firstname: form.firstname,
        lastname: form.lastname,
        email_perso: form.email_perso || undefined,
        email_ynov: form.email_ynov || undefined,
        phone_number: form.phone_number || undefined,
        diploma: form.diploma || undefined,
        status: form.status || undefined,
        rate: form.rate ? Number(form.rate) : undefined,
      });
      onLinked(
        teacher.id,
        `${teacher.firstname} ${teacher.lastname}`,
        teacher.potentialCount,
      );
    } catch {
      setError("Erreur lors de la création.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-xs font-semibold text-blue-700">Réponse</p>
        <p className="text-sm font-bold text-slate-800">
          {submissionPrenom} {submissionNom}
        </p>
        <p className="text-xs text-slate-500">{submissionEmail}</p>
      </div>

      <div className="flex overflow-hidden rounded-lg border border-gray-200">
        <button
          onClick={() => setTab("link")}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
            tab === "link"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 hover:bg-gray-50"
          }`}
        >
          <FaLink className="h-3.5 w-3.5 flex-shrink-0" />
          Lier à un enseignant existant
        </button>
        <button
          onClick={() => setTab("create")}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
            tab === "create"
              ? "bg-blue-600 text-white"
              : "bg-white text-slate-600 hover:bg-gray-50"
          }`}
        >
          <FaUserPlus className="h-3.5 w-3.5 flex-shrink-0" />
          Créer un nouvel enseignant
        </button>
      </div>

      {tab === "link" && (
        <div className="space-y-3">
          <div className="relative">
            <FaSearch className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, prénom ou email..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pr-3 pl-9 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="max-h-56 divide-y divide-gray-50 overflow-y-auto rounded-lg border border-gray-200">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                Aucun enseignant trouvé.
              </p>
            ) : (
              filtered.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {t.firstname} {t.lastname}
                    </p>
                    {t.email_perso && (
                      <p className="text-xs text-slate-400">{t.email_perso}</p>
                    )}
                    {t.status && (
                      <p className="text-xs text-slate-400">{getStatusLabel(t.status)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => void handleLink(t)}
                    disabled={linkMut.isPending}
                    className="flex-shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    Lier
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "create" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Prénom *
              </label>
              <input
                value={form.firstname}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstname: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Nom *
              </label>
              <input
                value={form.lastname}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastname: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Statut
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">- Sélectionner -</option>
                <option value="Salaried">Salarié</option>
                <option value="Contractor">Prestataire</option>
                <option value="To be recruited">À recruter</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Tarif (€/h)
              </label>
              <input
                type="number"
                value={form.rate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rate: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Ex: 45"
                min="0"
                max="1000"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Diplôme
            </label>
            <input
              value={form.diploma}
              onChange={(e) =>
                setForm((f) => ({ ...f, diploma: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Email personnel
              </label>
              <input
                type="email"
                value={form.email_perso}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email_perso: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Email Ynov
              </label>
              <input
                type="email"
                value={form.email_ynov}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email_ynov: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Téléphone
            </label>
            <input
              value={form.phone_number}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone_number: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            onClick={() => void handleCreate()}
            disabled={createMut.isPending}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {createMut.isPending ? "Création..." : "Créer et lier l'enseignant"}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function AutoLinkedBanner({ count }: { count: number }) {
  if (count === 0) {
    return (
      <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Aucune reponse &quot;oui&quot; ou &quot;peut-etre&quot; a associer
        automatiquement pour ce candidat.
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
      <FaCheck className="h-4 w-4 flex-shrink-0 text-emerald-600" />
      <p className="text-sm text-emerald-700">
        <span className="font-semibold">{count}</span> module
        {count > 1 ? "s ont" : " a"} ete automatiquement ajoute
        {count > 1 ? "s" : ""} comme intervenant potentiel, d&apos;apres ses
        reponses au sondage.
      </p>
    </div>
  );
}

function ModuleAssignStep({
  teacherId,
  teacherName,
  subjectTitle,
  potentialCount,
  onAssigned,
  onSkip,
}: {
  teacherId: string;
  teacherName: string;
  subjectTitle: string;
  potentialCount: number;
  onAssigned: () => void;
  onSkip: () => void;
}) {
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [error, setError] = useState("");
  const { data: promoModules } = api.promoModules.getAll.useQuery();
  const assignMut = api.surveyAdmin.assignTeacherToModule.useMutation();

  const handleAssign = async () => {
    if (!selectedModuleId) {
      setError("Sélectionnez un module.");
      return;
    }
    setError("");
    try {
      await assignMut.mutateAsync({
        teacherId,
        promoModuleId: selectedModuleId,
      });
      onAssigned();
    } catch {
      setError("Erreur lors de l'assignation.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
        <FaCheck className="h-4 w-4 flex-shrink-0 text-emerald-600" />
        <div>
          <p className="text-xs font-semibold text-emerald-700">
            Enseignant lié avec succès
          </p>
          <p className="text-sm font-bold text-slate-800">{teacherName}</p>
        </div>
      </div>

      <AutoLinkedBanner count={potentialCount} />

      <div>
        <p className="mb-1 text-sm font-semibold text-slate-700">
          Matière concernée
        </p>
        <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-slate-500">
          {subjectTitle}
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Ajouter un module supplementaire (optionnel)
        </label>
        <select
          value={selectedModuleId}
          onChange={(e) => setSelectedModuleId(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">- Sélectionner un module -</option>
          {(promoModules ?? []).map((pm) => (
            <option key={pm.id} value={pm.id}>
              {pm.promo.level} {pm.promo.specialty} - {pm.module.name} (
              {pm.workload}h)
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-400">
          Les modules avec une reponse &quot;oui&quot;/&quot;peut-etre&quot;
          sont deja ajoutes automatiquement ci-dessus. Utilisez ce champ pour un
          module supplementaire non couvert par le sondage.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-gray-50"
        >
          Terminer
        </button>
        <button
          onClick={() => void handleAssign()}
          disabled={assignMut.isPending || !selectedModuleId}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {assignMut.isPending ? (
            "Assignation..."
          ) : (
            <>
              Confirmer <FaArrowRight className="h-3 w-3" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function DoneStep({
  teacherName,
  onClose,
}: {
  teacherName: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
        <FaCheck className="h-6 w-6 text-emerald-600" />
      </div>
      <div>
        <p className="text-base font-bold text-slate-800">Liaison effectuée</p>
        <p className="mt-1 text-sm text-slate-500">
          <span className="font-semibold">{teacherName}</span> a été traité(e)
          avec succès.
        </p>
      </div>
      <button
        onClick={onClose}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Fermer
      </button>
    </div>
  );
}

export default function SubmissionConvertModal({
  submissionId,
  submissionNom,
  submissionPrenom,
  submissionEmail,
  submissionPhone,
  submissionDiplome,
  subjectTitle,
  onClose,
}: Props) {
  const [step, setStep] = useState<Step>("teacher");
  const [linkedTeacherId, setLinkedTeacherId] = useState("");
  const [linkedTeacherName, setLinkedTeacherName] = useState("");
  const [autoPotentialCount, setAutoPotentialCount] = useState(0);

  const stepLabels: Record<Step, string> = {
    teacher: "1. Lier un enseignant",
    module: "2. Lier au module",
    done: "Terminé",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-600 uppercase">
              Conversion réponse
            </p>
            <h2 className="text-base font-bold text-slate-800">
              {stepLabels[step]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-gray-100 hover:text-slate-600"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">
          {step === "teacher" && (
            <TeacherLinkStep
              submissionId={submissionId}
              submissionNom={submissionNom}
              submissionPrenom={submissionPrenom}
              submissionEmail={submissionEmail}
              submissionPhone={submissionPhone}
              submissionDiplome={submissionDiplome}
              onLinked={(id, name, potentialCount) => {
                setLinkedTeacherId(id);
                setLinkedTeacherName(name);
                setAutoPotentialCount(potentialCount);
                setStep("module");
              }}
            />
          )}
          {step === "module" && (
            <ModuleAssignStep
              teacherId={linkedTeacherId}
              teacherName={linkedTeacherName}
              potentialCount={autoPotentialCount}
              subjectTitle={subjectTitle}
              onAssigned={() => setStep("done")}
              onSkip={() => setStep("done")}
            />
          )}
          {step === "done" && (
            <DoneStep teacherName={linkedTeacherName} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
