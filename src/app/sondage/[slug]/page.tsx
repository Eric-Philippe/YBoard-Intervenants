"use client";

import { use, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaTimes, FaArrowLeft } from "react-icons/fa";
import { SurveyProvider, useSurvey } from "~/contexts/SurveyContext";
import { MobileNav, DesktopSidebar } from "~/components/survey/SurveyNav";
import CommonFields from "~/components/survey/CommonFields";
import SubcategorySection from "~/components/survey/SubcategorySection";
import FinalSection from "~/components/survey/FinalSection";
import SubmitSuccess from "~/components/survey/SubmitSuccess";
import { useAuth } from "~/contexts/AuthContext";

function RgpdModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
          aria-label="Fermer"
        >
          <FaTimes className="h-4 w-4" />
        </button>
        <h2 className="mb-4 text-lg font-bold text-slate-800">
          Informations légales &amp; RGPD
        </h2>
        <div className="space-y-4 text-sm text-slate-600">
          <section>
            <h3 className="mb-1 font-semibold text-slate-700">
              Données collectées
            </h3>
            <p>
              Les données saisies dans ce formulaire (informations de contact,
              disponibilités, compétences pédagogiques) sont collectées
              exclusivement dans le cadre du traitement de votre candidature en
              tant qu&apos;intervenant au sein de Ynov Campus Toulouse. Elles ne
              sont ni revendues, ni transmises à des tiers.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold text-slate-700">
              Durée de conservation
            </h3>
            <p>
              Vos données sont conservées uniquement le temps nécessaire au
              traitement de votre candidature. Une fois la décision prise, elles
              sont supprimées ou anonymisées.
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold text-slate-700">Hébergement</h3>
            <p>
              Ce service est hébergé en France (Toulouse). Vos données ne
              quittent pas le territoire de l&apos;Union Européenne. Ce service
              est développé et maintenu par{" "}
              <a
                href="mailto:louise.pascual@ynov.com"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Eric PHILIPPE - ericphlpp@proton.me
              </a>
            </p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold text-slate-700">Vos droits</h3>
            <p>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
              de rectification et de retrait de vos données. Pour exercer ces
              droits ou demander la suppression de votre soumission, contactez :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <a
                  href="mailto:louise.pascual@ynov.com"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  louise.pascual@ynov.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:ericphlpp@proton.me"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  ericphlpp@proton.me
                </a>
              </li>
            </ul>
          </section>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}

function SurveyFooter() {
  const [rgpdOpen, setRgpdOpen] = useState(false);
  return (
    <>
      <footer className="border-t border-gray-200 bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-slate-500">
            Pour toute question, demande d&apos;aide, précision ou problème
            rencontré avec le formulaire, merci de contacter{" "}
            <a
              href="mailto:louise.pascual@ynov.com"
              className="text-blue-600 underline hover:text-blue-800"
            >
              louise.pascual@ynov.com
            </a>
            .
          </p>
          <button
            onClick={() => setRgpdOpen(true)}
            className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Mentions légales &amp; RGPD
          </button>
        </div>
      </footer>
      {rgpdOpen && <RgpdModal onClose={() => setRgpdOpen(false)} />}
    </>
  );
}

const ENABLE_SONDAGE = process.env.NEXT_PUBLIC_ENABLE_SONDAGE !== "false";

export default function SondagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  if (!ENABLE_SONDAGE) {
    redirect("/");
  }

  return (
    <SurveyProvider perimeterSlug={slug}>
      <SondagePageInner slug={slug} />
    </SurveyProvider>
  );
}

function SondagePageInner({ slug }: { slug: string }) {
  const { currentSection, loading, error, perimeterTitle } = useSurvey();
  const { isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return <SubmitSuccess />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">
              YLab
            </span>
            <h1 className="text-lg leading-tight font-bold text-slate-800">
              Questionnaires Matières{perimeterTitle ? ` · ${perimeterTitle}` : ""}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Link
                href={`/sondage/${slug}/admin`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                <FaArrowLeft className="h-3 w-3" />
                Panel d&apos;administration
              </Link>
            )}
            <span className="hidden items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:inline-flex">
              Candidature intervenant
            </span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="text-sm text-slate-500">
              Chargement du questionnaire...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="mx-auto mt-16 max-w-lg px-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <MobileNav />
          <div className="mx-auto flex max-w-screen-xl items-start">
            <DesktopSidebar />
            <main className="min-w-0 flex-1 px-4 py-6 pb-16 sm:px-6">
              {currentSection === "common" ? (
                <CommonFields />
              ) : currentSection === "final" ? (
                <FinalSection onSubmit={() => setSubmitted(true)} />
              ) : (
                <SubcategorySection categorySlug={currentSection} />
              )}
            </main>
          </div>
          <SurveyFooter />
        </>
      )}
    </div>
  );
}
