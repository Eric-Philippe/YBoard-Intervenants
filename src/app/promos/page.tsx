"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { useModal } from "~/contexts/ModalContext";
import { api } from "~/trpc/react";
import { useForm } from "@mantine/form";
import {
  IconSchool,
  IconPlus,
  IconTrash,
  IconPencil,
  IconArrowRight,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { SPEC_ICONS } from "~/utils/categoryIcons";
import { ImportPromosModal } from "./ImportPromosModal";

// Define interface for promo data from API
interface PromoWithModules {
  id: string;
  level: string;
  specialty: string;
  icon?: string | null;
  perimeterId: string;
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
  icon: string;
}

export default function PromosPage() {
  const [selectedPromo, setSelectedPromo] = useState<PromoWithModules | null>(
    null,
  );
  const [editModal, setEditModal] = useState(false);
  const [migrateModal, setMigrateModal] = useState(false);
  const [migrateTarget, setMigrateTarget] = useState<PromoWithModules | null>(
    null,
  );
  const [targetPerimeterId, setTargetPerimeterId] = useState("");
  const [migrateError, setMigrateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<"specialty" | "level" | null>(
    null,
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: "specialty" | "level") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const { isAuthenticated, loading: authLoading } = useAuth();
  const { setCreatePromoModal } = useModal();
  const router = useRouter();

  // tRPC hooks
  const utils = api.useUtils();
  const promosQuery = api.promos.getAll.useQuery();
  const perimetersQuery = api.perimeters.getAll.useQuery();
  const mineQuery = api.perimeters.getMine.useQuery();

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
      notifications.show({ title: "Erreur", message: `Erreur lors de la modification : ${error.message}`, color: "red" });
    },
  });

  const migratePromoMutation = api.promos.migrateToPerimeter.useMutation({
    onSuccess: (result) => {
      void utils.promos.invalidate();
      void utils.modules.invalidate();
      void utils.promoModules.invalidate();
      setMigrateModal(false);
      setMigrateTarget(null);
      setTargetPerimeterId("");
      setMigrateError(null);
      setLoading(false);
      notifications.show({
        title: "Migration réussie",
        message: `Promo migrée vers "${result.targetPerimeterTitle}" (${result.migratedModulesCount} module(s) déplacé(s)).`,
        color: "green",
      });
    },
    onError: (error) => {
      setLoading(false);
      setMigrateError(error.message);
    },
  });

  // Form
  const editForm = useForm<PromoFormData>({
    initialValues: {
      level: "",
      specialty: "",
      icon: "default",
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
      icon: promo.icon ?? "default",
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

  const handleMigrateClick = (promo: PromoWithModules) => {
    setMigrateTarget(promo);
    setTargetPerimeterId("");
    setMigrateError(null);
    setMigrateModal(true);
  };

  const handleMigrateConfirm = async () => {
    if (!migrateTarget || !targetPerimeterId) return;
    setLoading(true);
    setMigrateError(null);
    try {
      await migratePromoMutation.mutateAsync({
        id: migrateTarget.id,
        targetPerimeterId,
      });
    } catch (error) {
      console.error("Failed to migrate promo:", error);
    }
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

  const promos = [...(promosQuery.data ?? [])].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField].toLowerCase();
    const bValue = b[sortField].toLowerCase();
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="glass-card">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <IconSchool size={24} className="text-brand-600" />
                Gestion des Promos
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <ImportPromosModal perimeterId={mineQuery.data?.activePerimeterId ?? undefined} />
                <button
                  onClick={() => setCreatePromoModal(true)}
                  className="btn-primary"
                >
                  <IconPlus size={18} />
                  Créer une Promo
                </button>
                <button
                  onClick={() => router.push("/promos/delete")}
                  className="btn-danger"
                >
                  <IconTrash size={18} />
                  Supprimer des Promos
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="btn-secondary"
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
              <div className="glass-panel overflow-x-auto rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white/40">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        <button
                          onClick={() => handleSort("level")}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          Niveau
                          {sortField === "level" && (
                            <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        <button
                          onClick={() => handleSort("specialty")}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          Spécialité (Nom)
                          {sortField === "specialty" && (
                            <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Modules associés
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {promos.map((promo) => (
                      <tr
                        key={promo.id}
                        className="transition-all duration-200 ease-out hover:bg-white/60"
                      >
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
                              className="flex items-center gap-1 text-brand-600 transition-colors duration-200 ease-out hover:text-brand-900"
                              disabled={loading}
                            >
                              <IconPencil size={16} />
                              Modifier
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleMigrateClick(promo)}
                              className="flex items-center gap-1 text-purple-600 transition-colors duration-200 ease-out hover:text-purple-900"
                              disabled={loading}
                            >
                              <IconArrowRight size={16} />
                              Migrer
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => router.push(`/promos/delete`)}
                              className="flex items-center gap-1 text-red-600 transition-colors duration-200 ease-out hover:text-red-900"
                              disabled={loading}
                            >
                              <IconTrash size={16} />
                              Supprimer
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
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-black/30 backdrop-blur-sm">
          <div className="glass-card relative top-20 mx-auto w-[600px] p-5">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                  <IconPencil size={18} />
                  Modifier la promo
                </h3>
                <button
                  onClick={() => {
                    setEditModal(false);
                    setSelectedPromo(null);
                    editForm.reset();
                  }}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors duration-200 ease-out hover:bg-gray-100 hover:text-gray-600"
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
                    className="input-glass"
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
                    className="input-glass"
                    placeholder="Ex: Informatique, Marketing..."
                    disabled={loading}
                  />
                  {editForm.errors.specialty && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.errors.specialty}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Icône (sondage)
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {Object.entries(SPEC_ICONS).map(([key, meta]) => {
                      const Icon = meta.Icon;
                      const selected = editForm.values.icon === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          title={meta.label}
                          onClick={() => editForm.setFieldValue("icon", key)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                            selected
                              ? "border-brand-400 bg-brand-100"
                              : "border-gray-200 bg-white/60 hover:border-brand-200"
                          }`}
                        >
                          <Icon size={15} color={meta.color} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditModal(false);
                      setSelectedPromo(null);
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
                    {loading ? (
                      "Modification..."
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <IconPencil size={16} />
                        Modifier
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Migrate Promo Modal */}
      {migrateModal && migrateTarget && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-black/30 backdrop-blur-sm">
          <div className="glass-card relative top-20 mx-auto w-[620px] p-5">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                  <IconArrowRight size={18} />
                  Migrer la promo vers un autre périmètre
                </h3>
                <button
                  onClick={() => {
                    setMigrateModal(false);
                    setMigrateTarget(null);
                    setMigrateError(null);
                  }}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors duration-200 ease-out hover:bg-gray-100 hover:text-gray-600"
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

              <div className="mb-4 rounded-md bg-purple-50 p-3">
                <p className="text-sm text-purple-800">
                  <strong>Promo:</strong> {migrateTarget.level} -{" "}
                  {migrateTarget.specialty}
                  <br />
                  <strong>Modules concernés:</strong>{" "}
                  {getPromoModulesCount(migrateTarget)}
                </p>
              </div>

              <p className="mb-4 text-sm text-gray-600">
                La promo et tous ses modules seront déplacés vers le périmètre
                sélectionné. Si un module est mutualisé avec une autre promo
                restée dans le périmètre actuel, la migration sera refusée.
              </p>

              <div className="mb-4">
                <label
                  htmlFor="target-perimeter"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Périmètre de destination
                </label>
                <select
                  id="target-perimeter"
                  value={targetPerimeterId}
                  onChange={(e) => setTargetPerimeterId(e.target.value)}
                  className="input-glass"
                  disabled={loading}
                >
                  <option value="">-- Choisir un périmètre --</option>
                  {(perimetersQuery.data ?? [])
                    .filter((p) => p.id !== migrateTarget.perimeterId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                </select>
              </div>

              {migrateError && (
                <div className="mb-4 rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-700">{migrateError}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMigrateModal(false);
                    setMigrateTarget(null);
                    setMigrateError(null);
                  }}
                  className="btn-secondary flex-1 justify-center"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => void handleMigrateConfirm()}
                  className="btn-primary flex-1 justify-center"
                  disabled={loading || !targetPerimeterId}
                >
                  {loading ? (
                    "Migration..."
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <IconArrowRight size={16} />
                      Migrer
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
