"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";
import {
  PromoSelection,
  DeletionWarning,
  ModulesList,
  EmptyState,
  DeleteConfirmationModal,
  SuccessModal,
} from "./components";
import type { Promo, ModuleWithPromoModules, DeletionStats } from "./types";

export default function DeleteModulesPage() {
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [selectedModule, setSelectedModule] =
    useState<ModuleWithPromoModules | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [deletionResult, setDeletionResult] = useState<DeletionStats | null>(
    null,
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // tRPC hooks
  const utils = api.useUtils();
  const promosQuery = api.promos.getAll.useQuery();
  const modulesQuery = api.modules.getAllWithRelations.useQuery();

  const deleteModuleMutation = api.modules.delete.useMutation({
    onSuccess: (data) => {
      setDeletionResult(data.deletedData);
      void utils.modules.invalidate();
      void utils.promoModules.invalidate();
      setDeleteModal(false);
      setSelectedModule(null);
      setLoading(false);
      setShowSuccessModal(true);
    },
    onError: (error) => {
      console.error("Error deleting module:", error);
      setLoading(false);
      alert(`Erreur lors de la suppression: ${error.message}`);
    },
  });

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

  const handleDeleteClick = (moduleItem: ModuleWithPromoModules) => {
    setSelectedModule(moduleItem);
    setDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedModule) return;

    setLoading(true);
    try {
      await deleteModuleMutation.mutateAsync({ id: selectedModule.id });
    } catch (error) {
      console.error("Failed to delete module:", error);
      setLoading(false);
    }
  };

  const toggleDetails = (moduleId: string) => {
    setShowDetails(showDetails === moduleId ? null : moduleId);
  };

  const handlePromoSelect = (promo: Promo) => {
    setSelectedPromo(promo);
  };

  // Filter modules based on selected promo
  const getFilteredModules = () => {
    if (!selectedPromo) return [];

    return (modulesQuery.data ?? [])
      .filter((moduleItem) =>
        moduleItem.promoModules?.some((pm) => pm.promo.id === selectedPromo.id),
      )
      .map((moduleItem) => ({
        ...moduleItem,
        promoModules: moduleItem.promoModules?.filter(
          (pm) => pm.promo.id === selectedPromo.id,
        ),
      }));
  };

  if (promosQuery.isLoading || modulesQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (promosQuery.error || modulesQuery.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">Erreur lors du chargement</div>
      </div>
    );
  }

  const promos = promosQuery.data ?? [];
  const filteredModules = getFilteredModules();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                🗑️ Suppression des Modules
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

            <DeletionWarning />

            {/* Promo Selection */}
            <PromoSelection
              promos={promos}
              selectedPromo={selectedPromo}
              onPromoSelect={handlePromoSelect}
            />

            {/* Modules List */}
            {selectedPromo ? (
              <ModulesList
                selectedPromo={selectedPromo}
                modules={filteredModules}
                showDetails={showDetails}
                loading={loading}
                onToggleDetails={toggleDetails}
                onDeleteClick={handleDeleteClick}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && selectedModule && (
        <DeleteConfirmationModal
          module={selectedModule}
          loading={loading}
          onCancel={() => {
            setDeleteModal(false);
            setSelectedModule(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && deletionResult && (
        <SuccessModal
          deletionResult={deletionResult}
          onClose={() => {
            setShowSuccessModal(false);
            setDeletionResult(null);
          }}
        />
      )}
    </div>
  );
}
