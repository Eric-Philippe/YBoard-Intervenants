"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

// Import types and components
import type { Promo, PromoModule, TeacherRelation } from "./types";
import { calculateWorkloadStats } from "./utils";
import {
  PromoSelection,
  ModuleSelection,
  ModuleDetailsHeader,
  WorkloadBreakdown,
  TeacherManagement,
  SummaryReport,
} from "./components";

function ModuleDetailsContent() {
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [selectedModule, setSelectedModule] = useState<PromoModule | null>(
    null,
  );
  const [activeTeacher, setActiveTeacher] = useState<TeacherRelation | null>(
    null,
  );

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // tRPC hooks
  const utils = api.useUtils();
  const promosQuery = api.promos.getAll.useQuery();
  const modulesQuery = api.modules.getByPromo.useQuery(
    { promoId: selectedPromo?.id ?? "" },
    { enabled: !!selectedPromo },
  );

  // Mutation hooks for drag and drop operations
  const createPotentialMutation = api.relations.createPotential.useMutation({
    onSuccess: async () => {
      await utils.modules.getByPromo.invalidate();
      if (selectedPromo?.id) {
        const updatedModules = await utils.modules.getByPromo.fetch({
          promoId: selectedPromo.id,
        });
        const updatedModule = updatedModules.find(
          (m) => m.id === selectedModule?.id,
        );
        if (updatedModule) {
          setSelectedModule(updatedModule);
        }
      }
    },
  });

  const createSelectedMutation = api.relations.createSelected.useMutation({
    onSuccess: async () => {
      await utils.modules.getByPromo.invalidate();
      if (selectedPromo?.id) {
        const updatedModules = await utils.modules.getByPromo.fetch({
          promoId: selectedPromo.id,
        });
        const updatedModule = updatedModules.find(
          (m) => m.id === selectedModule?.id,
        );
        if (updatedModule) {
          setSelectedModule(updatedModule);
        }
      }
    },
  });

  const deletePotentialMutation = api.relations.deletePotential.useMutation({
    onSuccess: async () => {
      await utils.modules.getByPromo.invalidate();
      if (selectedPromo?.id) {
        const updatedModules = await utils.modules.getByPromo.fetch({
          promoId: selectedPromo.id,
        });
        const updatedModule = updatedModules.find(
          (m) => m.id === selectedModule?.id,
        );
        if (updatedModule) {
          setSelectedModule(updatedModule);
        }
      }
    },
  });

  const deleteSelectedMutation = api.relations.deleteSelected.useMutation({
    onSuccess: async () => {
      await utils.modules.getByPromo.invalidate();
      if (selectedPromo?.id) {
        const updatedModules = await utils.modules.getByPromo.fetch({
          promoId: selectedPromo.id,
        });
        const updatedModule = updatedModules.find(
          (m) => m.id === selectedModule?.id,
        );
        if (updatedModule) {
          setSelectedModule(updatedModule);
        }
      }
    },
  });

  const deleteOngoingMutation = api.relations.deleteOngoing.useMutation({
    onSuccess: async () => {
      await utils.modules.getByPromo.invalidate();
      if (selectedPromo?.id) {
        const updatedModules = await utils.modules.getByPromo.fetch({
          promoId: selectedPromo.id,
        });
        const updatedModule = updatedModules.find(
          (m) => m.id === selectedModule?.id,
        );
        if (updatedModule) {
          setSelectedModule(updatedModule);
        }
      }
    },
  });

  // Delete functions for each relation type
  const handleDeleteOngoing = async (
    teacherId: string,
    promoModulesId: string,
  ) => {
    try {
      await deleteOngoingMutation.mutateAsync({
        teacherId,
        promoModulesId,
      });
    } catch (error) {
      console.error("Error deleting ongoing relation:", error);
      alert("Erreur lors de la suppression de la relation ongoing");
    }
  };

  const handleDeletePotential = async (
    teacherId: string,
    promoModulesId: string,
  ) => {
    try {
      await deletePotentialMutation.mutateAsync({
        teacherId,
        promoModulesId,
      });
    } catch (error) {
      console.error("Error deleting potential relation:", error);
      alert("Erreur lors de la suppression de la relation potential");
    }
  };

  const handleDeleteSelected = async (
    teacherId: string,
    promoModulesId: string,
  ) => {
    try {
      await deleteSelectedMutation.mutateAsync({
        teacherId,
        promoModulesId,
      });
    } catch (error) {
      console.error("Error deleting selected relation:", error);
      alert("Erreur lors de la suppression de la relation selected");
    }
  };

  // Effect to handle URL parameters for direct navigation
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
      const foundModule = modulesQuery.data.find((m) => m.id === moduleId);
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

  // Drag and drop handlers
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

    // Prevent invalid moves according to the rules
    if (sourceStatus === targetStatus) return;

    // Rule 2: Cannot move from Potential to Ongoing
    if (sourceStatus === "potential" && targetStatus === "ongoing") {
      alert("Impossible de déplacer un enseignant de Potential vers Ongoing");
      return;
    }

    // Rule 3: Cannot move from Selected to Ongoing
    if (sourceStatus === "selected" && targetStatus === "ongoing") {
      alert("Impossible de déplacer un enseignant de Selected vers Ongoing");
      return;
    }

    const teacher = sourceData.teacher;

    try {
      // Handle duplication (from Ongoing to Potential/Selected)
      if (sourceStatus === "ongoing") {
        // Duplicate: create new relation without deleting the old one
        if (targetStatus === "potential") {
          await createPotentialMutation.mutateAsync({
            teacherId: teacher.teacherId,
            promoModulesId: selectedModule.id,
            workload: teacher.workload,
          });
        } else if (targetStatus === "selected") {
          await createSelectedMutation.mutateAsync({
            teacherId: teacher.teacherId,
            promoModulesId: selectedModule.id,
            workload: teacher.workload,
          });
        }
      } else {
        // Handle move (from Potential to Selected or Selected to Potential)
        // Delete the old relation
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

        // Create the new relation
        if (targetStatus === "potential") {
          await createPotentialMutation.mutateAsync({
            teacherId: teacher.teacherId,
            promoModulesId: selectedModule.id,
            workload: teacher.workload,
          });
        } else if (targetStatus === "selected") {
          await createSelectedMutation.mutateAsync({
            teacherId: teacher.teacherId,
            promoModulesId: selectedModule.id,
            workload: teacher.workload,
          });
        }
      }
    } catch (error) {
      console.error("Error during drag and drop operation:", error);
      alert("Erreur lors du déplacement de l'enseignant");
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

  const handlePromoSelect = (promo: Promo) => {
    setSelectedPromo(promo);
    setSelectedModule(null); // Reset module selection when promo changes
  };

  const handleModuleSelect = (module: PromoModule) => {
    setSelectedModule(module);
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

  const promos = promosQuery.data ?? [];
  const modules = modulesQuery.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                🔍 Détails des Modules
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push("/modules")}
                  className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                >
                  Gestion des Modules
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Retour à l&apos;accueil
                </button>
              </div>
            </div>

            {/* Promo Selection */}
            <PromoSelection
              promos={promos}
              selectedPromo={selectedPromo}
              onPromoSelect={handlePromoSelect}
            />

            {/* Module Selection */}
            {selectedPromo && (
              <ModuleSelection
                selectedPromo={selectedPromo}
                modules={modules}
                selectedModule={selectedModule}
                onModuleSelect={handleModuleSelect}
                isLoading={modulesQuery.isLoading}
              />
            )}

            {/* Module Details */}
            {selectedModule && (
              <div>
                <h2 className="mb-6 text-xl font-semibold text-gray-800">
                  📊 Détails du Module: {selectedModule.module.name}
                </h2>

                {(() => {
                  const stats = calculateWorkloadStats(selectedModule);

                  return (
                    <div className="space-y-6">
                      {/* Header Info */}
                      <ModuleDetailsHeader
                        selectedModule={selectedModule}
                        stats={stats}
                      />

                      {/* Workload Breakdown */}
                      <WorkloadBreakdown stats={stats} />

                      {/* Teachers Details with Drag and Drop */}
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

                      {/* Summary Report */}
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
    </div>
  );
}

export default function ModuleDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Chargement...</div>
        </div>
      }
    >
      <ModuleDetailsContent />
    </Suspense>
  );
}
