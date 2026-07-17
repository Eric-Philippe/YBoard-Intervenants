"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { useModal } from "~/contexts/ModalContext";
import { api } from "~/trpc/react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  CoverageBar,
  RelationsHoverPreview,
  StepIndicator,
} from "~/components";
import {
  LuBookOpen,
  LuClipboardList,
  LuLayers,
  LuLayoutGrid,
  LuPencil,
  LuPlus,
  LuSearch,
  LuSearchX,
  LuShare2,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import { getWorkloadStatusColor, getWorkloadStatusText } from "~/lib/utils";

// Reuse the data model and building blocks of the (now merged) module details panel
import type { Promo, PromoModule, TeacherRelation } from "./details/types";
import {
  calculateWorkloadStats,
  transformPromoModule,
} from "./details/utils";
import {
  ModuleDetailsHeader,
  WorkloadBreakdown,
  TeacherManagement,
  SummaryReport,
} from "./details/components";
import { MutualizeModuleModal } from "./MutualizeModuleModal";

function ModulesPageContent() {
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [selectedModule, setSelectedModule] = useState<PromoModule | null>(
    null,
  );
  const [activeTeacher, setActiveTeacher] = useState<TeacherRelation | null>(
    null,
  );
  const [editModal, setEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PromoModule | null>(null);
  const [mutualizeTarget, setMutualizeTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"name" | "workload" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const modulesListRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openCreateModuleModal } = useModal();

  // tRPC hooks
  const utils = api.useUtils();
  const promosQuery = api.promos.getAll.useQuery();
  const modulesQuery = api.modules.getByPromo.useQuery(
    { promoId: selectedPromo?.id ?? "" },
    { enabled: !!selectedPromo },
  );
  const { data: mutualizationCounts = {} } =
    api.modules.getMutualizationCounts.useQuery();

  // Mutations - module CRUD
  const updateModuleMutation = api.modules.update.useMutation({
    onSuccess: () => {
      void utils.modules.invalidate();
      void utils.promoModules.invalidate();
    },
  });

  const updatePromoModuleMutation = api.promoModules.update.useMutation({
    onSuccess: () => {
      void utils.modules.invalidate();
      void utils.promoModules.invalidate();
      setEditModal(false);
      setEditTarget(null);
      editForm.reset();
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error updating module:", error);
      setLoading(false);
      notifications.show({ title: "Erreur", message: `Erreur lors de la modification : ${error.message}`, color: "red" });
    },
  });

  // Mutations - teacher relations (drag and drop in the details panel)
  const createPotentialMutation = api.relations.createPotential.useMutation({
    onSuccess: () => void utils.modules.getByPromo.invalidate(),
  });

  const createSelectedMutation = api.relations.createSelected.useMutation({
    onSuccess: () => void utils.modules.getByPromo.invalidate(),
  });

  const deletePotentialMutation = api.relations.deletePotential.useMutation({
    onSuccess: () => void utils.modules.getByPromo.invalidate(),
  });

  const deleteSelectedMutation = api.relations.deleteSelected.useMutation({
    onSuccess: () => void utils.modules.getByPromo.invalidate(),
  });

  const deleteOngoingMutation = api.relations.deleteOngoing.useMutation({
    onSuccess: () => void utils.modules.getByPromo.invalidate(),
  });

  // Forms
  const editForm = useForm<{
    name: string;
    description: string;
    workload: string;
    nombreHeureTDP: string;
    nombreHeureFFP: string;
  }>({
    initialValues: {
      name: "",
      description: "",
      workload: "",
      nombreHeureTDP: "",
      nombreHeureFFP: "",
    },
    validate: {
      name: (value) => (!value ? "Le nom du module est requis" : null),
      description: (value) =>
        !value.trim() ? "La description est requise, elle alimente le sondage" : null,
      workload: (value) => {
        if (!value) return "La charge de travail est requise";
        const numValue = Number(value);
        return isNaN(numValue) || numValue <= 0
          ? "La charge de travail doit être supérieure à 0"
          : null;
      },
    },
  });

  // Deep-link support: /modules?promoId=...&moduleId=...
  useEffect(() => {
    const promoId = searchParams.get("promoId");
    const moduleId = searchParams.get("moduleId");

    if (promoId && promosQuery.data && !selectedPromo) {
      const promo = promosQuery.data.find((p) => p.id === promoId);
      if (promo) {
        setSelectedPromo(promo);
      }
    }

    if (moduleId && modulesQuery.data && selectedPromo && !selectedModule) {
      const transformedModules = modulesQuery.data.map(transformPromoModule);
      const foundModule = transformedModules.find((m) => m.id === moduleId);
      if (foundModule) {
        setSelectedModule(foundModule);
      }
    }
  }, [
    searchParams,
    promosQuery.data,
    modulesQuery.data,
    selectedPromo,
    selectedModule,
  ]);

  // Keep the detail panel in sync whenever the underlying data is refetched
  // (relation drag-and-drop, module edit, etc.)
  useEffect(() => {
    if (!selectedModule || !modulesQuery.data) return;
    const transformedModules = modulesQuery.data.map(transformPromoModule);
    const updated = transformedModules.find((m) => m.id === selectedModule.id);
    setSelectedModule(updated ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulesQuery.data]);

  // Smoothly scroll down to the module list once a promo is selected
  useEffect(() => {
    if (selectedPromo && modulesListRef.current) {
      modulesListRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedPromo]);

  // Smoothly scroll down to the unlocked details panel once a module is selected
  useEffect(() => {
    if (selectedModule && detailsRef.current) {
      detailsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedModule]);

  // Drag and drop handlers for the teacher management section
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const teacherData = active.data.current as {
      teacher: TeacherRelation;
      status: "ongoing" | "potential" | "selected";
    };
    setActiveTeacher(teacherData.teacher);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTeacher(null);

    if (!over || !selectedModule) return;

    const sourceData = active.data.current as {
      teacher: TeacherRelation;
      status: "ongoing" | "potential" | "selected";
    };
    const targetStatus = over.id as "ongoing" | "potential" | "selected";
    const sourceStatus = sourceData.status;

    if (sourceStatus === targetStatus) return;

    if (sourceStatus === "potential" && targetStatus === "ongoing") {
      notifications.show({ message: "Impossible de déplacer un enseignant de Potential vers Ongoing", color: "orange" });
      return;
    }

    if (sourceStatus === "selected" && targetStatus === "ongoing") {
      notifications.show({ message: "Impossible de déplacer un enseignant de Selected vers Ongoing", color: "orange" });
      return;
    }

    const teacher = sourceData.teacher;

    const getEffectiveRate = (teacherRelation: TeacherRelation): number => {
      if (teacherRelation.rate !== null && teacherRelation.rate !== undefined) {
        return Number(teacherRelation.rate);
      }
      if (
        teacherRelation.teacher?.rate !== null &&
        teacherRelation.teacher?.rate !== undefined
      ) {
        const rate = teacherRelation.teacher.rate;
        if (typeof rate === "number") return rate;
        if (typeof rate === "string") {
          const parsed = parseFloat(rate);
          return isNaN(parsed) ? 1 : parsed;
        }
        if (rate && typeof rate === "object" && "toNumber" in rate) {
          try {
            return (rate as { toNumber: () => number }).toNumber();
          } catch {
            return 1;
          }
        }
      }
      return 1;
    };

    const hasSplitRate = teacher.rateTDP != null && teacher.rateFFP != null;
    const ratePayload = hasSplitRate
      ? { rateTDP: Number(teacher.rateTDP), rateFFP: Number(teacher.rateFFP) }
      : { rate: getEffectiveRate(teacher) };

    try {
      if (sourceStatus === "ongoing") {
        if (targetStatus === "potential") {
          await createPotentialMutation.mutateAsync({
            teacherId: teacher.teacherId,
            promoModulesId: selectedModule.id,
            workload: teacher.workload,
            ...ratePayload,
          });
        } else if (targetStatus === "selected") {
          await createSelectedMutation.mutateAsync({
            teacherId: teacher.teacherId,
            promoModulesId: selectedModule.id,
            workload: teacher.workload,
            ...ratePayload,
          });
        }
      } else {
        if (sourceStatus === "potential") {
          await deletePotentialMutation.mutateAsync({
            teacherId: teacher.teacherId,
            promoModulesId: selectedModule.id,
          });
        } else if (sourceStatus === "selected") {
          await deleteSelectedMutation.mutateAsync({
            teacherId: teacher.teacherId,
            promoModulesId: selectedModule.id,
          });
        }

        if (targetStatus === "potential") {
          await createPotentialMutation.mutateAsync({
            teacherId: teacher.teacherId,
            promoModulesId: selectedModule.id,
            workload: teacher.workload,
            ...ratePayload,
          });
        } else if (targetStatus === "selected") {
          await createSelectedMutation.mutateAsync({
            teacherId: teacher.teacherId,
            promoModulesId: selectedModule.id,
            workload: teacher.workload,
            ...ratePayload,
          });
        }
      }
    } catch (error) {
      console.error("Error during drag and drop operation:", error);
      notifications.show({ title: "Erreur", message: "Erreur lors du déplacement de l'enseignant", color: "red" });
    }
  };

  const handleDeleteOngoing = async (
    teacherId: string,
    promoModulesId: string,
  ) => {
    try {
      await deleteOngoingMutation.mutateAsync({ teacherId, promoModulesId });
    } catch (error) {
      console.error("Error deleting ongoing relation:", error);
      notifications.show({ title: "Erreur", message: "Erreur lors de la suppression de la relation ongoing", color: "red" });
    }
  };

  const handleDeletePotential = async (
    teacherId: string,
    promoModulesId: string,
  ) => {
    try {
      await deletePotentialMutation.mutateAsync({ teacherId, promoModulesId });
    } catch (error) {
      console.error("Error deleting potential relation:", error);
      notifications.show({ title: "Erreur", message: "Erreur lors de la suppression de la relation potential", color: "red" });
    }
  };

  const handleDeleteSelected = async (
    teacherId: string,
    promoModulesId: string,
  ) => {
    try {
      await deleteSelectedMutation.mutateAsync({ teacherId, promoModulesId });
    } catch (error) {
      console.error("Error deleting selected relation:", error);
      notifications.show({ title: "Erreur", message: "Erreur lors de la suppression de la relation selected", color: "red" });
    }
  };

  // Authentication check
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  // Event handlers
  const handlePromoSelect = (promo: Promo) => {
    setSelectedPromo(promo);
    setSelectedModule(null); // Reset module/detail selection when promo changes
    setSearchTerm("");
    setSortField(null);
  };

  const handleModuleRowClick = (module: PromoModule) => {
    setSelectedModule((current) =>
      current?.id === module.id ? null : module,
    );
  };

  const handleSort = (field: "name" | "workload") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEditClick = (module: PromoModule) => {
    setEditTarget(module);
    editForm.setValues({
      name: module.module.name,
      description: module.module.description ?? "",
      workload: String(module.workload),
      nombreHeureTDP: module.module.nombreHeureTDP
        ? String(module.module.nombreHeureTDP)
        : "",
      nombreHeureFFP: module.module.nombreHeureFFP
        ? String(module.module.nombreHeureFFP)
        : "",
    });
    setEditModal(true);
  };

  const handleEditSubmit = async (values: {
    name: string;
    description: string;
    workload: string;
    nombreHeureTDP: string;
    nombreHeureFFP: string;
  }) => {
    if (!editTarget) return;
    setLoading(true);
    try {
      await updateModuleMutation.mutateAsync({
        id: editTarget.module.id,
        name: values.name,
        description: values.description,
        nombreHeureTDP: values.nombreHeureTDP ? Number(values.nombreHeureTDP) : undefined,
        nombreHeureFFP: values.nombreHeureFFP ? Number(values.nombreHeureFFP) : undefined,
      });

      await updatePromoModuleMutation.mutateAsync({
        id: editTarget.id,
        workload: Number(values.workload),
      });
    } catch (error) {
      console.error("Failed to update module:", error);
      setLoading(false);
    }
  };

  const getRelationsCount = (promoModule: PromoModule) => {
    const ongoing = promoModule.ongoing?.length ?? 0;
    const potential = promoModule.potential?.length ?? 0;
    const selected = promoModule.selected?.length ?? 0;
    return ongoing + potential + selected;
  };

  // Function to calculate total workload for a promo
  const calculatePromoTotalWorkload = (promo: Promo): number => {
    return (
      promo.promoModules?.reduce(
        (total, promoModule) => total + promoModule.workload,
        0,
      ) ?? 0
    );
  };

  // Global coverage across all modules of a promo (Selected workload / total workload)
  const calculatePromoCoverage = (promo: Promo): number => {
    const totalWorkload = calculatePromoTotalWorkload(promo);
    if (totalWorkload === 0) return 0;
    const totalSelected =
      promo.promoModules?.reduce(
        (total, promoModule) =>
          total +
          (promoModule.selected?.reduce(
            (sum, relation) => sum + relation.workload,
            0,
          ) ?? 0),
        0,
      ) ?? 0;
    return Math.round((totalSelected / totalWorkload) * 10000) / 100;
  };

  if (promosQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Chargement des promos...</div>
      </div>
    );
  }

  if (promosQuery.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">Erreur lors du chargement des promos</div>
      </div>
    );
  }

  const promos = [...(promosQuery.data ?? [])].sort(
    (a, b) => a.level.localeCompare(b.level) || a.specialty.localeCompare(b.specialty),
  );
  const modules = (modulesQuery.data ?? []).map(transformPromoModule);

  // Filter and sort modules
  const filteredAndSortedModules = modules
    .filter((module) =>
      module.module.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue: string | number;
      let bValue: string | number;

      if (sortField === "name") {
        aValue = a.module.name.toLowerCase();
        bValue = b.module.name.toLowerCase();
      } else {
        aValue = a.workload;
        bValue = b.workload;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const currentStep = selectedModule ? 2 : selectedPromo ? 1 : 0;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="glass-card">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <LuLayoutGrid className="h-6 w-6 text-brand-600" />
                Gestion des Modules
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => router.push("/modules/delete")}
                  className="btn-danger"
                >
                  <LuTrash2 className="h-4 w-4" />
                  Supprimer des Modules
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="btn-secondary"
                >
                  Retour à l&apos;accueil
                </button>
              </div>
            </div>

            {/* Navigation Stepper */}
            <StepIndicator
              steps={[
                { label: "Promo" },
                { label: "Module" },
                { label: "Détails" },
              ]}
              currentStep={currentStep}
            />

            {/* Promo Selection */}
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
                <LuClipboardList className="h-5 w-5 text-blue-600" />
                Sélectionnez une Promo
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {promos.map((promo) => {
                  const totalWorkload = calculatePromoTotalWorkload(promo);
                  const moduleCount = promo.promoModules?.length ?? 0;
                  const coverage = calculatePromoCoverage(promo);

                  return (
                    <button
                      key={promo.id}
                      onClick={() => handlePromoSelect(promo)}
                      className={`surface-hover rounded-xl border-2 p-4 text-left transition-all duration-200 ease-out ${
                        selectedPromo?.id === promo.id
                          ? "border-brand-500 bg-brand-50/70"
                          : "glass-panel border-transparent hover:border-brand-200"
                      }`}
                    >
                      <div className="font-semibold text-gray-900">
                        {promo.level} - {promo.specialty}
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Modules:</span>
                          <span className="font-medium text-gray-800">
                            {moduleCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total heures:</span>
                          <span className="font-semibold text-blue-600">
                            {totalWorkload}h
                          </span>
                        </div>
                      </div>
                      {moduleCount > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              Couverture globale
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 font-medium ${getWorkloadStatusColor(coverage)}`}
                              title={getWorkloadStatusText(coverage)}
                            >
                              {coverage}%
                            </span>
                          </div>
                          <div className="mt-1">
                            <CoverageBar coverage={coverage} size="sm" />
                          </div>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Cliquez pour voir les modules
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modules List */}
            {selectedPromo && (
              <div ref={modulesListRef} className="scroll-mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                      <LuBookOpen className="h-5 w-5 text-blue-600" />
                      Modules de {selectedPromo.level} -{" "}
                      {selectedPromo.specialty}
                    </h2>
                    {modules.length > 0 && (
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          <strong>{filteredAndSortedModules.length}</strong>{" "}
                          module
                          {filteredAndSortedModules.length > 1 ? "s" : ""}
                          {filteredAndSortedModules.length !== modules.length &&
                            ` (${modules.length} au total)`}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                          Total:{" "}
                          <strong className="ml-1">
                            {filteredAndSortedModules.reduce(
                              (total, pm) => total + pm.workload,
                              0,
                            )}
                            h
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => openCreateModuleModal(selectedPromo.id)}
                    className="btn-primary"
                  >
                    <LuPlus className="h-4 w-4" />
                    Créer un Module
                  </button>
                </div>

                {/* Search Bar */}
                {modules.length > 0 && (
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Rechercher un module par nom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-glass py-2 pr-4 pl-10"
                      />
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <LuSearch className="h-5 w-5 text-gray-400" />
                      </div>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          <LuX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {modulesQuery.isLoading ? (
                  <div className="py-8 text-center">
                    <div className="text-lg">Chargement des modules...</div>
                  </div>
                ) : modules.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <LuLayers className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-sm font-medium text-gray-900">
                      Aucun module trouvé
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                      Cliquez sur le bouton &quot;Créer un Module&quot;
                      ci-dessus pour créer votre premier module pour cette promo
                    </p>
                  </div>
                ) : filteredAndSortedModules.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <LuSearchX className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-sm font-medium text-gray-900">
                      Aucun module trouvé pour &quot;{searchTerm}&quot;
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                      Essayez de modifier votre recherche ou de supprimer le
                      filtre
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Effacer la recherche
                    </button>
                  </div>
                ) : (
                  <div className="glass-panel overflow-x-auto rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white/40">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            <button
                              onClick={() => handleSort("name")}
                              className="flex items-center space-x-1 transition-colors duration-200 ease-out hover:text-gray-700"
                            >
                              <span>Nom du Module</span>
                              {sortField === "name" && (
                                <span className="text-blue-500">
                                  {sortDirection === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            <button
                              onClick={() => handleSort("workload")}
                              className="flex items-center space-x-1 transition-colors duration-200 ease-out hover:text-gray-700"
                            >
                              <span>Charge de travail</span>
                              {sortField === "workload" && (
                                <span className="text-blue-500">
                                  {sortDirection === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Couverture
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Relations enseignants
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAndSortedModules.map((promoModule) => {
                          const stats = calculateWorkloadStats(promoModule);
                          const isActive = selectedModule?.id === promoModule.id;
                          return (
                            <tr
                              key={promoModule.id}
                              className={`transition-all duration-200 ease-out ${
                                isActive ? "bg-brand-50/70" : "hover:bg-white/60"
                              }`}
                            >
                              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                <button
                                  onClick={() =>
                                    handleModuleRowClick(promoModule)
                                  }
                                  className={`flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left font-medium transition-colors duration-200 ease-out hover:text-brand-600 hover:underline ${
                                    isActive ? "text-brand-700" : ""
                                  }`}
                                >
                                  <LuBookOpen className="h-4 w-4 text-gray-400" />
                                  {promoModule.module.name}
                                </button>
                                {(mutualizationCounts[promoModule.module.id] ?? 1) > 1 && (
                                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                                    <LuShare2 className="h-3 w-3" />
                                    Mutualise ({mutualizationCounts[promoModule.module.id]}x)
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                  {promoModule.workload}h
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                <div className="flex items-center gap-2">
                                  <div className="w-20">
                                    <CoverageBar
                                      coverage={stats.coverage}
                                      size="sm"
                                    />
                                  </div>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${getWorkloadStatusColor(stats.coverage)}`}
                                    title={getWorkloadStatusText(
                                      stats.coverage,
                                    )}
                                  >
                                    {stats.coverage}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                <RelationsHoverPreview
                                  ongoing={promoModule.ongoing}
                                  potential={promoModule.potential}
                                  selected={promoModule.selected}
                                >
                                  <span className="inline-flex cursor-default items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    {getRelationsCount(promoModule)} relation(s)
                                  </span>
                                </RelationsHoverPreview>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => handleEditClick(promoModule)}
                                    className="flex items-center gap-1 text-brand-600 transition-colors duration-200 ease-out hover:text-brand-900"
                                    disabled={loading}
                                  >
                                    <LuPencil className="h-4 w-4" />
                                    Modifier
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    onClick={() =>
                                      router.push(`/modules/delete`)
                                    }
                                    className="flex items-center gap-1 text-red-600 transition-colors duration-200 ease-out hover:text-red-900"
                                    disabled={loading}
                                  >
                                    <LuTrash2 className="h-4 w-4" />
                                    Supprimer
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Module Details (inline, unlocked once a module row is selected above) */}
            {selectedModule && (
              <div ref={detailsRef} className="mt-8 scroll-mt-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                    <LuLayoutGrid className="h-5 w-5 text-purple-600" />
                    Détails du Module: {selectedModule.module.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(selectedModule)}
                      className="btn-glass"
                      disabled={loading}
                    >
                      <LuPencil size={16} />
                      Modifier
                    </button>
                    <button
                      onClick={() =>
                        setMutualizeTarget({
                          id: selectedModule.module.id,
                          name: selectedModule.module.name,
                        })
                      }
                      className="btn-glass"
                    >
                      <LuShare2 size={16} />
                      Mutualiser
                    </button>
                  </div>
                </div>

                {(() => {
                  const stats = calculateWorkloadStats(selectedModule);

                  return (
                    <div className="space-y-6">
                      <ModuleDetailsHeader
                        selectedModule={selectedModule}
                        stats={stats}
                      />

                      <WorkloadBreakdown stats={stats} />

                      <TeacherManagement
                        selectedModule={selectedModule}
                        stats={stats}
                        activeTeacher={activeTeacher}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDeleteOngoing={handleDeleteOngoing}
                        onDeletePotential={handleDeletePotential}
                        onDeleteSelected={handleDeleteSelected}
                      />

                      <SummaryReport
                        selectedModule={selectedModule}
                        stats={stats}
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Module Modal */}
      {editModal && editTarget && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-black/30 backdrop-blur-sm">
          <div className="glass-card relative top-20 mx-auto w-96 p-5">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                  <LuPencil className="h-5 w-5 text-brand-600" />
                  Modifier le module
                </h3>
                <button
                  onClick={() => {
                    setEditModal(false);
                    setEditTarget(null);
                    editForm.reset();
                  }}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors duration-200 ease-out hover:bg-gray-100 hover:text-gray-600"
                >
                  <LuX className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 rounded-md bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>Module:</strong> {editTarget.module.name}
                  <br />
                  <strong>Promo:</strong> {editTarget.promo.level} -{" "}
                  {editTarget.promo.specialty}
                </p>
              </div>

              <form
                onSubmit={editForm.onSubmit(handleEditSubmit)}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="edit-name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Nom du Module
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    {...editForm.getInputProps("name")}
                    className="input-glass"
                    placeholder="Ex: Programmation Web, Base de données..."
                    disabled={loading}
                  />
                  {editForm.errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="edit-description"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    {...editForm.getInputProps("description")}
                    className="input-glass"
                    rows={3}
                    placeholder="Objectifs et contenu du module, utilisés dans le sondage..."
                    disabled={loading}
                  />
                  {editForm.errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="edit-workload"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Charge de travail (heures)
                  </label>
                  <input
                    type="number"
                    id="edit-workload"
                    {...editForm.getInputProps("workload")}
                    className="input-glass"
                    placeholder="Ex: 20, 30, 40..."
                    disabled={loading}
                    min="1"
                  />
                  {editForm.errors.workload && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.errors.workload}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-nombreHeureTDP"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Nb heures TDP
                    </label>
                    <input
                      type="number"
                      id="edit-nombreHeureTDP"
                      {...editForm.getInputProps("nombreHeureTDP")}
                      className="input-glass"
                      placeholder="Ex: 10"
                      disabled={loading}
                      min="1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-nombreHeureFFP"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Nb heures FFP
                    </label>
                    <input
                      type="number"
                      id="edit-nombreHeureFFP"
                      {...editForm.getInputProps("nombreHeureFFP")}
                      className="input-glass"
                      placeholder="Ex: 10"
                      disabled={loading}
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditModal(false);
                      setEditTarget(null);
                      editForm.reset();
                    }}
                    className="btn-secondary flex-1 justify-center"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 justify-center"
                    disabled={loading}
                  >
                    {!loading && <LuPencil className="h-4 w-4" />}
                    {loading ? "Modification..." : "Modifier"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {mutualizeTarget && (
        <MutualizeModuleModal
          moduleId={mutualizeTarget.id}
          moduleName={mutualizeTarget.name}
          onClose={() => setMutualizeTarget(null)}
        />
      )}
    </div>
  );
}

export default function ModulesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Chargement...</div>
        </div>
      }
    >
      <ModulesPageContent />
    </Suspense>
  );
}
