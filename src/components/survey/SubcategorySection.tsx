"use client";

import { FaArrowRight, FaFlagCheckered } from "react-icons/fa";
import { useSurvey } from "~/contexts/SurveyContext";
import { getCatIcon } from "~/utils/categoryIcons";
import SubjectCard from "./SubjectCard";

export default function SubcategorySection({ categorySlug }: { categorySlug: string }) {
  const { categories, formData, setCurrentSection } = useSurvey();

  const showMastere = formData.niveauAcademique !== "bac3";
  const visibleCategories = categories.filter(
    (c) => c.level === "bachelor" || showMastere,
  );

  const category = categories.find((c) => c.slug === categorySlug);
  const currentIndex = visibleCategories.findIndex((c) => c.slug === categorySlug);
  const nextCategory = currentIndex >= 0 ? visibleCategories[currentIndex + 1] : null;

  if (!category) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-slate-500 shadow-sm">
        Catégorie introuvable.
      </div>
    );
  }

  const { Icon: CatIcon, color: iconColor } = getCatIcon(category);
  const { Icon: NextCatIcon } = nextCategory ? getCatIcon(nextCategory) : {};

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-3">
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${iconColor}18`, color: iconColor }}
          >
            <CatIcon className="h-5 w-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-800">{category.title}</h2>
        </div>
        {category.introduction && (
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {category.introduction}
          </p>
        )}
      </div>

      {(category.subjects ?? []).length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          Aucune matière configurée pour cette catégorie.
        </div>
      ) : (
        <>
          <p className="px-1 text-xs text-slate-500">
            {category.subjects.length} matière{category.subjects.length > 1 ? "s" : ""} —
            Sélectionnez votre disponibilité pour chaque matière. «&nbsp;Non&nbsp;» est sélectionné par défaut.
          </p>
          <div className="space-y-3">
            {category.subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          onClick={() => setCurrentSection("final")}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <FaFlagCheckered className="h-4 w-4" />
          Terminer le questionnaire
        </button>
        {nextCategory && NextCatIcon && (
          <button
            onClick={() => {
              setCurrentSection(nextCategory.slug);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <NextCatIcon className="h-4 w-4 opacity-80" />
            {nextCategory.label}
            <FaArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
