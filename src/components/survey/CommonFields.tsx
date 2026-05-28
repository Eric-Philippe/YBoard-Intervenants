"use client";

import { useSurvey, type FormData } from "~/contexts/SurveyContext";

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {hint && <p className="mb-2 text-xs text-slate-500">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors";

export default function CommonFields({ errors = {} }: { errors?: Partial<Record<keyof FormData, string>> }) {
  const { formData, updateFormData, commonComplete, setCurrentSection, categories } = useSurvey();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    updateFormData(e.target.name as keyof FormData, e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Informations générales</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ces informations sont communes à toutes les réponses et nous permettront de vous recontacter.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Nom" required error={errors.nom}>
            <input
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Dupont"
              className={inputClass}
            />
          </Field>
          <Field label="Prénom" required error={errors.prenom}>
            <input
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Jean"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Adresse e-mail" required error={errors.email}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jean.dupont@exemple.fr"
              className={inputClass}
            />
          </Field>
          <Field label="Numéro de téléphone">
            <input
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Niveau académique le plus élevé (diplôme d'État ou titre RNCP)"
          required
          hint="Bac+3 minimum pour intervenir en Bachelor, Bac+5 minimum pour intervenir en Mastère."
          error={errors.niveauAcademique}
        >
          <div className="flex flex-wrap gap-3">
            {[
              { value: "bac3", label: "Bac+3" },
              { value: "bac5", label: "Bac+5" },
              { value: "bac8", label: "Bac+8" },
              { value: "autre", label: "Autre" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  formData.niveauAcademique === opt.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-slate-600 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="niveauAcademique"
                  value={opt.value}
                  checked={formData.niveauAcademique === opt.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {formData.niveauAcademique === "autre" && (
            <input
              name="niveauAcademiqueAutre"
              value={formData.niveauAcademiqueAutre}
              onChange={handleChange}
              placeholder="Précisez votre niveau..."
              className={`${inputClass} mt-2`}
            />
          )}
        </Field>

        <Field
          label="Intitulé du diplôme ou titre et établissement d'obtention"
          required
          error={errors.intituleDiplome}
        >
          <input
            name="intituleDiplome"
            value={formData.intituleDiplome}
            onChange={handleChange}
            placeholder="Master Informatique - Université Paris Saclay"
            className={inputClass}
          />
        </Field>

        <Field
          label="Années d'expérience professionnelle totale (alternance : 1 an = 0,5)"
          required
          error={errors.anneesExperience}
        >
          <div className="flex flex-wrap gap-3">
            {[
              { value: "0-5", label: "Entre 0 et 5 ans" },
              { value: "5-10", label: "Entre 5 et 10 ans" },
              { value: "10+", label: "Plus de 10 ans" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  formData.anneesExperience === opt.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-slate-600 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="anneesExperience"
                  value={opt.value}
                  checked={formData.anneesExperience === opt.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Dans quel(s) domaine(s) exercez-vous professionnellement ?">
          <textarea
            name="domainesExercice"
            value={formData.domainesExercice}
            onChange={handleChange}
            placeholder="Développement web, conseil IT, data science..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Field label="Projets personnels, contributions ou réalisations (side projects, veilles, publications...)">
          <textarea
            name="projetsPersonnels"
            value={formData.projetsPersonnels}
            onChange={handleChange}
            placeholder="Contributeur open source, blog technique, projets GitHub..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Field label="Lien vers votre profil LinkedIn / CV en ligne / Portfolio">
          <input
            name="lienProfil"
            value={formData.lienProfil}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/votre-profil"
            className={inputClass}
          />
        </Field>

        <Field label="Remarques générales / contraintes de disponibilité et volume horaire souhaité">
          <textarea
            name="remarques"
            value={formData.remarques}
            onChange={handleChange}
            placeholder="Disponible le soir et le week-end, max 2 jours par semaine..."
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </Field>
      </div>

      {commonComplete && categories.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setCurrentSection(categories[0]!.slug)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Continuer vers les matières
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
