import { FaCheckCircle, FaEnvelope } from "react-icons/fa";

export default function SubmitSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg space-y-6 rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="flex justify-center">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <FaCheckCircle className="h-10 w-10 text-emerald-500" />
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Questionnaire soumis
          </h1>
          <p className="mt-3 leading-relaxed text-slate-500">
            Merci d&apos;avoir pris le temps de répondre à notre questionnaire.
            Votre réponse a bien été enregistrée et sera traitée par notre
            équipe dans les meilleurs délais.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <FaEnvelope className="h-4 w-4 flex-shrink-0" />
          <span>
            Notre équipe prendra contact avec vous prochainement pour faire
            suite à votre candidature.
          </span>
        </div>
        <p className="text-xs text-slate-400">
          YBoard - Questionnaires Matières
        </p>
      </div>
    </div>
  );
}
