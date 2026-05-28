"use client";

import { useState } from "react";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";
import { useSurvey } from "~/contexts/SurveyContext";
import { api } from "~/trpc/react";

export default function FinalSection({ onSubmit }: { onSubmit: () => void }) {
  const { formData, updateFormData, subjectResponses } = useSurvey();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  const submitMutation = api.survey.submit.useMutation({
    onSuccess: () => onSubmit(),
    onError: (err) => {
      if (
        err.message.includes("EMAIL_DUPLICATE") ||
        err.data?.code === "CONFLICT"
      ) {
        setServerError(
          "Cette adresse e-mail est déjà associée à une réponse précédente. Veuillez utiliser une adresse différente ou contacter l'administrateur.",
        );
      } else {
        setServerError(
          "Une erreur s'est produite lors de la réponse. Veuillez réessayer.",
        );
      }
    },
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.nom) errs.nom = "Champ obligatoire";
    if (!formData.prenom) errs.prenom = "Champ obligatoire";
    if (!formData.email) errs.email = "Champ obligatoire";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      errs.email = "Adresse e-mail invalide";
    if (!formData.niveauAcademique) errs.niveauAcademique = "Champ obligatoire";
    if (!formData.intituleDiplome) errs.intituleDiplome = "Champ obligatoire";
    if (!formData.anneesExperience) errs.anneesExperience = "Champ obligatoire";
    if (!formData.finalChoice) errs.finalChoice = "Veuillez faire un choix";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setServerError(
        'Veuillez corriger les erreurs avant de soumettre. Vérifiez notamment la section "Informations générales".',
      );
      return;
    }
    setErrors({});
    setServerError("");

    const searchParams = new URLSearchParams(window.location.search);
    const origin = searchParams.get("utm_source") ?? null;

    submitMutation.mutate({
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      niveau_academique: formData.niveauAcademique,
      niveau_academique_autre: formData.niveauAcademiqueAutre || null,
      intitule_diplome: formData.intituleDiplome,
      annees_experience: formData.anneesExperience,
      domaines_exercice: formData.domainesExercice,
      projets_personnels: formData.projetsPersonnels,
      lien_profil: formData.lienProfil,
      remarques: formData.remarques,
      final_choice: formData.finalChoice,
      origin,
      subject_responses: Object.entries(subjectResponses)
        .filter(([, v]) => v.response && v.response !== "non")
        .map(([subjectId, v]) => ({
          subject_id: subjectId,
          response: v.response,
          condition_text: v.conditionText || null,
        })),
    });
  };

  const choices = [
    { value: "oui", label: "Oui, j'ai pu faire mon choix." },
    {
      value: "oui_recontacte",
      label:
        "Oui, et je souhaite également être recontacté(e) pour d'autres propositions de collaborations (jurys, projets, conférences...).",
    },
    {
      label:
        "Non, mais je souhaite être recontacté(e) pour d'autres projets propositions de collaborations (jurys, projets, conférences...).",
      value: "non_recontacte",
    },
    {
      value: "non_sans_suite",
      label: "Non, et je ne souhaite pas être recontacté(e).",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Section finale</h2>
          <p className="mt-1 text-sm text-slate-500">
            Vous êtes presque arrivé(e) à la fin du questionnaire. Merci de
            répondre à la question suivante.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Avez-vous pu faire votre choix ?
            <span className="ml-0.5 text-red-500">*</span>
          </label>
          <div className="mt-2 space-y-2">
            {choices.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  formData.finalChoice === opt.value
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="finalChoice"
                  value={opt.value}
                  checked={formData.finalChoice === opt.value}
                  onChange={(e) =>
                    updateFormData("finalChoice", e.target.value)
                  }
                  className="mt-0.5 accent-blue-600"
                />
                <span className="text-sm font-medium text-slate-700">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
          {errors.finalChoice && (
            <p className="mt-1 text-xs text-red-500">{errors.finalChoice}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {submitMutation.isPending ? (
              <FaSpinner className="h-4 w-4 animate-spin" />
            ) : (
              <FaPaperPlane className="h-4 w-4" />
            )}
            {submitMutation.isPending
              ? "Envoi en cours..."
              : "Soumettre le questionnaire"}
          </button>
        </div>
      </div>
    </div>
  );
}
