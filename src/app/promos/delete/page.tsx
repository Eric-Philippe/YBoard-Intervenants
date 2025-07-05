"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";
import {
  type PromoWithModules,
  type DeletionStats,
  DeletionWarning,
  PromosList,
  EmptyState,
  DeleteConfirmationModal,
  SuccessModal,
} from "./";

export default function DeletePromosPage() {
  const [selectedPromo, setSelectedPromo] = useState<PromoWithModules | null>(
    null,
  );
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
  const promosQuery = api.promos.getAllWithRelations.useQuery();

  const deletePromoMutation = api.promos.delete.useMutation({
    onSuccess: (data) => {
      setDeletionResult(data.deletedData);
      void utils.promos.invalidate();
      void utils.promoModules.invalidate();
      setDeleteModal(false);
      setSelectedPromo(null);
      setLoading(false);
      setShowSuccessModal(true);
    },
    onError: (error) => {
      console.error("Error deleting promo:", error);
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

  const handleDeleteClick = (promo: PromoWithModules) => {
    setSelectedPromo(promo);
    setDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPromo) return;

    setLoading(true);
    try {
      await deletePromoMutation.mutateAsync({ id: selectedPromo.id });
    } catch (error) {
      console.error("Failed to delete promo:", error);
      setLoading(false);
    }
  };

  const toggleDetails = (promoId: string) => {
    setShowDetails(showDetails === promoId ? null : promoId);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                🗑️ Suppression des Promos
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push("/promos")}
                  className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                >
                  Gestion des Promos
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

            {promos.length === 0 ? (
              <EmptyState />
            ) : (
              <PromosList
                promos={promos}
                showDetails={showDetails}
                onToggleDetails={toggleDetails}
                onDeleteClick={handleDeleteClick}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && selectedPromo && (
        <DeleteConfirmationModal
          promo={selectedPromo}
          loading={loading}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteModal(false);
            setSelectedPromo(null);
          }}
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
