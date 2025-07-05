"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { useModal } from "~/contexts/ModalContext";
import { api } from "~/trpc/react";
import { useForm } from "@mantine/form";

// Define interface for promo data from API
interface PromoWithModules {
  id: string;
  level: string;
  specialty: string;
  promoModules?: Array<{
    id: string;
    moduleId: string;
    promoId: string;
    workload: number;
    module: {
      id: string;
      name: string;
    };
  }>;
}

interface PromoFormData {
  level: string;
  specialty: string;
}

export default function PromosPage() {
  const [selectedPromo, setSelectedPromo] = useState<PromoWithModules | null>(
    null,
  );
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const { setCreatePromoModal } = useModal();
  const router = useRouter();

  // tRPC hooks
  const utils = api.useUtils();
  const promosQuery = api.promos.getAll.useQuery();

  // Mutations
  const updatePromoMutation = api.promos.update.useMutation({
    onSuccess: () => {
      void utils.promos.invalidate();
      void utils.promoModules.invalidate();
      setEditModal(false);
      setSelectedPromo(null);
      editForm.reset();
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error updating promo:", error);
      setLoading(false);
      alert(`Erreur lors de la modification: ${error.message}`);
    },
  });

  // Form
  const editForm = useForm<PromoFormData>({
    initialValues: {
      level: "",
      specialty: "",
    },
    validate: {
      level: (value) => (!value ? "Le niveau est requis" : null),
      specialty: (value) => (!value ? "La spécialité est requise" : null),
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

  // Event handlers
  const handleEditClick = (promo: PromoWithModules) => {
    setSelectedPromo(promo);
    editForm.setValues({
      level: promo.level,
      specialty: promo.specialty,
    });
    setEditModal(true);
  };

  const handleEditSubmit = async (values: PromoFormData) => {
    if (!selectedPromo) return;
    setLoading(true);
    try {
      await updatePromoMutation.mutateAsync({
        id: selectedPromo.id,
        ...values,
      });
    } catch (error) {
      console.error("Failed to update promo:", error);
      setLoading(false);
    }
  };

  const getPromoModulesCount = (promo: PromoWithModules) => {
    return promo.promoModules?.length ?? 0;
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
                📚 Gestion des Promos
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => setCreatePromoModal(true)}
                  className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                >
                  ➕ Créer une Promo
                </button>
                <button
                  onClick={() => router.push("/promos/delete")}
                  className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                  🗑️ Supprimer des Promos
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Retour à l&apos;accueil
                </button>
              </div>
            </div>

            {promos.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-sm font-medium text-gray-900">
                  Aucune promo trouvée
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  Utilisez le menu de la sidebar pour créer votre première promo
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Niveau
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Spécialité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Modules associés
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {promos.map((promo) => (
                      <tr key={promo.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                          {promo.level}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {promo.specialty}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {getPromoModulesCount(promo)} module(s)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(promo)}
                              className="text-blue-600 transition-colors hover:text-blue-900"
                              disabled={loading}
                            >
                              ✏️ Modifier
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => router.push(`/promos/delete`)}
                              className="text-red-600 transition-colors hover:text-red-900"
                              disabled={loading}
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Promo Modal */}
      {editModal && selectedPromo && (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
          <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  ✏️ Modifier la promo
                </h3>
                <button
                  onClick={() => {
                    setEditModal(false);
                    setSelectedPromo(null);
                    editForm.reset();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4 rounded-md bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>Promo actuelle:</strong> {selectedPromo.level} -{" "}
                  {selectedPromo.specialty}
                </p>
              </div>

              <form
                onSubmit={editForm.onSubmit(handleEditSubmit)}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="edit-level"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Niveau
                  </label>
                  <select
                    id="edit-level"
                    {...editForm.getInputProps("level")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="">Sélectionner un niveau</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="B3">B3</option>
                    <option value="M1">M1</option>
                    <option value="M2">M2</option>
                  </select>
                  {editForm.errors.level && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.errors.level}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="edit-specialty"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Spécialité
                  </label>
                  <input
                    type="text"
                    id="edit-specialty"
                    {...editForm.getInputProps("specialty")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ex: Informatique, Marketing..."
                    disabled={loading}
                  />
                  {editForm.errors.specialty && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.errors.specialty}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditModal(false);
                      setSelectedPromo(null);
                      editForm.reset();
                    }}
                    className="flex-1 rounded-md bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Modification..." : "✏️ Modifier"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
