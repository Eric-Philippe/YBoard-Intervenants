"use client";

import { useState, useRef, useEffect } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaCheck,
  FaLock,
  FaTrashAlt,
} from "react-icons/fa";
import { useSurvey, type SurveyCategory } from "~/contexts/SurveyContext";
import { getCatIcon } from "~/utils/categoryIcons";

type Badge = { type: "all" | "partial"; label: string } | null;

function BadgeChip({ badge }: { badge: Badge }) {
  if (!badge) return null;
  const cls =
    badge.type === "all"
      ? "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 leading-none flex-shrink-0"
      : "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 leading-none flex-shrink-0";
  return <span className={cls}>{badge.label}</span>;
}

function scrollToSubject(subjectId: string) {
  const el = document.getElementById(`subject-${subjectId}`);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function specLabel(spec: string | null | undefined): string {
  const map: Record<string, string> = {
    informatique: "Informatique",
    ia_data: "IA Data",
    developpement: "Développement",
    dev_fullstack: "Développement Fullstack",
    dev_mobile_iot: "Mobile IOT",
    integration_ia_dev: "Intégration IA & Dev",
    expert_ia: "Expert IA",
    data_engineer: "Data Engineer",
    systemes_embarques: "Systèmes Embarqués",
  };
  return (spec && map[spec]) ?? spec ?? "";
}

function buildCrumb(cat: SurveyCategory | undefined): string | null {
  if (!cat) return null;
  const lvl = cat.level === "mastere" ? "Mastère" : "Bachelor";
  if (cat.specialization) return `${lvl} ${cat.year} — ${specLabel(cat.specialization)}`;
  return `${lvl} ${cat.year}`;
}

function NavItem({
  label,
  badge,
  active,
  locked,
  onClick,
  subjects = [],
  onClose,
  CatIcon,
  iconColor,
}: {
  label: string;
  badge: Badge;
  active: boolean;
  locked: boolean;
  onClick: () => void;
  subjects?: SurveyCategory["subjects"];
  onClose?: () => void;
  CatIcon?: React.ElementType;
  iconColor?: string;
}) {
  const iconStyle = locked
    ? { color: "#cbd5e1" }
    : active
      ? { color: "rgba(255,255,255,0.85)" }
      : { color: iconColor };

  return (
    <div>
      <button
        onClick={locked ? undefined : () => { onClick(); onClose?.(); }}
        title={locked ? "Remplissez d'abord vos informations générales" : undefined}
        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
          locked
            ? "text-slate-300 cursor-not-allowed select-none"
            : active
              ? "bg-blue-600 text-white font-semibold shadow-sm"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
        }`}
      >
        {CatIcon && <CatIcon className="w-3.5 h-3.5 flex-shrink-0" style={iconStyle} />}
        <span className="flex-1 min-w-0 truncate leading-snug">{label}</span>
        {locked ? (
          <FaLock className="w-3 h-3 flex-shrink-0 text-slate-300" />
        ) : active ? null : badge ? (
          <BadgeChip badge={badge} />
        ) : null}
      </button>

      {active && subjects.length > 0 && (
        <div className="mt-1 ml-3 pl-3 border-l-2 border-blue-200 space-y-px">
          {subjects.map((subj) => (
            <button
              key={subj.id}
              onClick={() => { scrollToSubject(subj.id); onClose?.(); }}
              className="w-full flex items-start gap-2 px-2 py-1.5 rounded-md text-xs text-left text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
              <span className="leading-snug">{subj.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function YearGroup({
  year,
  levelLabel,
  categories,
  expanded,
  onToggle,
  locked,
  onClose,
}: {
  year: number;
  levelLabel: string;
  categories: SurveyCategory[];
  expanded: boolean;
  onToggle: () => void;
  locked: boolean;
  onClose?: () => void;
}) {
  const { currentSection, setCurrentSection, getCategoryBadge, getGroupBadge } = useSurvey();
  const catIds = categories.map((c) => c.id);
  const groupBadge = getGroupBadge(catIds);
  const yearTitle = `${levelLabel} ${year}`;

  if (categories.length === 1) {
    const cat = categories[0]!;
    const { Icon: CatIcon, color: iconColor } = getCatIcon(cat);
    return (
      <NavItem
        label={cat.label}
        badge={getCategoryBadge(cat.id)}
        active={currentSection === cat.slug}
        locked={locked}
        onClick={() => setCurrentSection(cat.slug)}
        subjects={cat.subjects ?? []}
        onClose={onClose}
        CatIcon={CatIcon}
        iconColor={iconColor}
      />
    );
  }

  return (
    <div>
      <button
        onClick={locked ? undefined : onToggle}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
          locked
            ? "text-slate-300 cursor-not-allowed"
            : "text-slate-600 hover:bg-slate-50 font-semibold"
        }`}
      >
        <span>{yearTitle}</span>
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          {!locked && groupBadge && <BadgeChip badge={groupBadge} />}
          {locked ? (
            <FaLock className="w-3 h-3 text-slate-300" />
          ) : expanded ? (
            <FaChevronDown className="w-3 h-3" />
          ) : (
            <FaChevronRight className="w-3 h-3" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="mt-1 ml-4 pl-3 border-l border-gray-200 space-y-px">
          {categories.map((cat) => {
            const { Icon: CatIcon, color: iconColor } = getCatIcon(cat);
            return (
              <NavItem
                key={cat.id}
                label={specLabel(cat.specialization) || cat.label}
                badge={getCategoryBadge(cat.id)}
                active={currentSection === cat.slug}
                locked={locked}
                onClick={() => setCurrentSection(cat.slug)}
                subjects={cat.subjects ?? []}
                onClose={onClose}
                CatIcon={CatIcon}
                iconColor={iconColor}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function LevelSection({
  labelText,
  categories,
  locked,
  onClose,
}: {
  labelText: string;
  categories: SurveyCategory[];
  locked: boolean;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>(
    { 1: true, 2: true, 3: true, 4: true, 5: true },
  );

  const byYear = categories.reduce<Record<number, SurveyCategory[]>>((acc, cat) => {
    acc[cat.year] ??= [];
    acc[cat.year]!.push(cat);
    return acc;
  }, {});

  const toggleYear = (year: number) =>
    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-1.5 mb-1"
      >
        <span className={`text-xs font-bold uppercase tracking-widest ${locked ? "text-slate-300" : "text-slate-400"}`}>
          {labelText}
        </span>
        {open
          ? <FaChevronDown className={`w-2.5 h-2.5 ${locked ? "text-slate-200" : "text-slate-400"}`} />
          : <FaChevronRight className={`w-2.5 h-2.5 ${locked ? "text-slate-200" : "text-slate-400"}`} />
        }
      </button>
      {open && (
        <div className="space-y-px">
          {Object.entries(byYear)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([year, cats]) => (
              <YearGroup
                key={year}
                year={Number(year)}
                levelLabel={labelText}
                categories={cats}
                expanded={!!expandedYears[Number(year)]}
                onToggle={() => toggleYear(Number(year))}
                locked={locked}
                onClose={onClose}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function ClearButton() {
  const { clearAll } = useSurvey();
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <span className="text-xs text-red-700 flex-1">Tout réinitialiser ?</span>
        <button
          onClick={() => { clearAll(); setConfirm(false); }}
          className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
        >
          Oui
        </button>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          Non
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
    >
      <FaTrashAlt className="w-3 h-3 flex-shrink-0" />
      Réinitialiser toutes les réponses
    </button>
  );
}

function NavContent({ onClose }: { onClose?: () => void }) {
  const { categories, currentSection, setCurrentSection, commonComplete, formData } = useSurvey();

  const bachelor = categories.filter((c) => c.level === "bachelor");
  const showMastere = formData.niveauAcademique !== "bac3";
  const mastere = showMastere ? categories.filter((c) => c.level === "mastere") : [];

  const activeCat = categories.find((c) => c.slug === currentSection);
  const crumb =
    currentSection === "common"
      ? null
      : currentSection === "final"
        ? "Section finale"
        : buildCrumb(activeCat);

  return (
    <nav className="flex flex-col h-full">
      {crumb && (
        <div className="px-4 py-2.5 border-b border-gray-100 bg-blue-50/60 flex-shrink-0">
          <p className="text-xs font-semibold text-blue-700 truncate" title={crumb}>
            {crumb}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <button
          onClick={() => { setCurrentSection("common"); onClose?.(); }}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left font-medium transition-all ${
            currentSection === "common"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="flex-1">Informations générales</span>
          {commonComplete && currentSection !== "common" && (
            <FaCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          )}
        </button>

        {!commonComplete && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 mx-1 mt-2">
            <FaLock className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-amber-700 leading-snug">
              Remplissez tous les champs requis pour accéder aux matières.
            </span>
          </div>
        )}

        {bachelor.length > 0 && (
          <div className="mt-3">
            <LevelSection labelText="Bachelor" categories={bachelor} locked={!commonComplete} onClose={onClose} />
          </div>
        )}

        {commonComplete && !showMastere ? (
          <div className="mt-3 px-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-1">Mastère</p>
            <p className="text-xs text-slate-400">Non disponible avec un niveau Bac+3.</p>
          </div>
        ) : mastere.length > 0 ? (
          <div className="mt-3">
            <LevelSection labelText="Mastère" categories={mastere} locked={!commonComplete} onClose={onClose} />
          </div>
        ) : null}

        <div className="my-2 h-px bg-gray-100" />

        <NavItem
          label="Section finale"
          badge={null}
          active={currentSection === "final"}
          locked={!commonComplete}
          onClick={() => setCurrentSection("final")}
          onClose={onClose}
        />
      </div>

      <div className="border-t border-gray-100 p-3 flex-shrink-0">
        <ClearButton />
      </div>
    </nav>
  );
}

export function MobileNav() {
  const { currentSection, categories } = useSurvey();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const activeCat = categories.find((c) => c.slug === currentSection);
  const currentLabel =
    currentSection === "common"
      ? "Informations générales"
      : currentSection === "final"
        ? "Section finale"
        : buildCrumb(activeCat) ?? activeCat?.label ?? "";

  return (
    <div className="sticky top-[65px] z-40 bg-white border-b border-gray-200 px-4 py-2">
      <div ref={ref} className="relative max-w-sm mx-auto">
        <button
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-gray-100 transition-colors"
        >
          <span className="truncate">{currentLabel}</span>
          <FaChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
            <NavContent onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-72 flex-shrink-0 sticky top-[65px] h-[calc(100vh-65px)]">
      <div className="flex flex-col flex-1 bg-white border-r border-gray-200 overflow-hidden">
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Navigation
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <NavContent />
        </div>
      </div>
    </aside>
  );
}
