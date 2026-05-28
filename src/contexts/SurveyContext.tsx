"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "~/trpc/react";

export type SurveySubject = {
  id: string;
  title: string;
  volumeHoraire: number;
  periode: string;
  avecMentor: boolean;
  contenu: string;
  sortOrder: number;
  categoryId: string;
};

export type SurveyCategory = {
  id: string;
  slug: string;
  label: string;
  level: string;
  year: number;
  specialization: string | null;
  sortOrder: number;
  title: string;
  introduction: string;
  subjects: SurveySubject[];
};

export type FormData = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  niveauAcademique: string;
  niveauAcademiqueAutre: string;
  intituleDiplome: string;
  anneesExperience: string;
  domainesExercice: string;
  projetsPersonnels: string;
  lienProfil: string;
  remarques: string;
  finalChoice: string;
};

export type SubjectResponse = {
  response: string;
  conditionText: string;
};

type Badge = { type: "all" | "partial"; label: string };

type SurveyContextType = {
  categories: SurveyCategory[];
  loading: boolean;
  error: string | null;
  currentSection: string;
  setCurrentSection: (section: string) => void;
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string) => void;
  subjectResponses: Record<string, SubjectResponse>;
  updateSubjectResponse: (subjectId: string, response: string, conditionText?: string) => void;
  getSubjectResponse: (subjectId: string) => SubjectResponse;
  getCategoryBadge: (categoryId: string) => Badge | null;
  getGroupBadge: (categoryIds: string[]) => Badge | null;
  commonComplete: boolean;
  clearAll: () => void;
};

const SurveyContext = createContext<SurveyContextType | null>(null);

const LS_FORM = "survey_form_data";
const LS_RESPONSES = "survey_subject_responses";
const LS_SECTION = "survey_current_section";

const defaultFormData: FormData = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  niveauAcademique: "",
  niveauAcademiqueAutre: "",
  intituleDiplome: "",
  anneesExperience: "",
  domainesExercice: "",
  projetsPersonnels: "",
  lienProfil: "",
  remarques: "",
  finalChoice: "",
};

function loadFromLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function isCommonComplete(fd: FormData): boolean {
  return !!(
    fd.nom &&
    fd.prenom &&
    fd.email &&
    fd.niveauAcademique &&
    fd.intituleDiplome &&
    fd.anneesExperience
  );
}

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<SurveyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>(() => {
    const saved = loadFromLS<Partial<FormData>>(LS_FORM, {});
    return { ...defaultFormData, ...saved };
  });

  const [subjectResponses, setSubjectResponses] = useState<Record<string, SubjectResponse>>(() =>
    loadFromLS<Record<string, SubjectResponse>>(LS_RESPONSES, {}),
  );

  const [currentSection, _setCurrentSection] = useState<string>(() => {
    const saved = loadFromLS<Partial<FormData>>(LS_FORM, {});
    if (!isCommonComplete({ ...defaultFormData, ...saved })) return "common";
    return loadFromLS<string>(LS_SECTION, "common") || "common";
  });

  const configQuery = api.survey.getConfig.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (configQuery.data) {
      setCategories(configQuery.data.categories as SurveyCategory[]);
      setLoading(false);
    }
    if (configQuery.error) {
      setError("Impossible de charger la configuration du questionnaire.");
      setLoading(false);
    }
  }, [configQuery.data, configQuery.error]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (formData.niveauAcademique !== "bac3") return;
    if (currentSection === "common" || currentSection === "final") return;
    const cat = categories.find((c) => c.slug === currentSection);
    if (cat && cat.level === "mastere") {
      _setCurrentSection("common");
      localStorage.setItem(LS_SECTION, "common");
    }
  }, [formData.niveauAcademique, currentSection, categories]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_FORM, JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_RESPONSES, JSON.stringify(subjectResponses));
    }
  }, [subjectResponses]);

  const setCurrentSection = (section: string) => {
    if (section !== "common" && !isCommonComplete(formData)) return;
    _setCurrentSection(section);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_SECTION, section);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSubjectResponse = (subjectId: string, response: string, conditionText = "") => {
    setSubjectResponses((prev) => ({
      ...prev,
      [subjectId]: { response, conditionText },
    }));
  };

  const getSubjectResponse = (subjectId: string): SubjectResponse =>
    subjectResponses[subjectId] ?? { response: "non", conditionText: "" };

  const clearAll = () => {
    setFormData(defaultFormData);
    setSubjectResponses({});
    _setCurrentSection("common");
    if (typeof window !== "undefined") {
      localStorage.removeItem(LS_FORM);
      localStorage.removeItem(LS_RESPONSES);
      localStorage.removeItem(LS_SECTION);
    }
  };

  const getCategoryBadge = (categoryId: string): Badge | null => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return null;
    const subjects = category.subjects ?? [];
    if (subjects.length === 0) return null;
    const positive = subjects.filter((s) => {
      const r = subjectResponses[s.id]?.response ?? "non";
      return r === "oui" || r === "peut_etre";
    });
    if (positive.length === 0) return null;
    if (positive.length === subjects.length) return { type: "all", label: "Toutes" };
    return { type: "partial", label: `${positive.length}/${subjects.length}` };
  };

  const getGroupBadge = (categoryIds: string[]): Badge | null => {
    const cats = categories.filter((c) => categoryIds.includes(c.id));
    const allSubjects = cats.flatMap((c) => c.subjects ?? []);
    if (allSubjects.length === 0) return null;
    const positive = allSubjects.filter((s) => {
      const r = subjectResponses[s.id]?.response ?? "non";
      return r === "oui" || r === "peut_etre";
    });
    if (positive.length === 0) return null;
    if (positive.length === allSubjects.length) return { type: "all", label: "Toutes" };
    return { type: "partial", label: `${positive.length}/${allSubjects.length}` };
  };

  const commonComplete = isCommonComplete(formData);

  return (
    <SurveyContext.Provider
      value={{
        categories,
        loading,
        error,
        currentSection,
        setCurrentSection,
        formData,
        updateFormData,
        subjectResponses,
        updateSubjectResponse,
        getSubjectResponse,
        getCategoryBadge,
        getGroupBadge,
        commonComplete,
        clearAll,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey(): SurveyContextType {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error("useSurvey must be used within SurveyProvider");
  return ctx;
}
