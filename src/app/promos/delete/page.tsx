"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";
import { IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
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
      notifications.show({ title: "Erreur", message: `Erreur lors de la suppression : ${error.message}`, color: "red" });
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
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="glass-card">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <IconTrash size={22} className="text-red-600" />
                Suppression des Promos
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => router.push("/promos")}
                  className="btn-glass"
                >
                  Gestion des Promos
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="btn-secondary"
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
