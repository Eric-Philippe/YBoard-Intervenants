"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";
import { useForm } from "@mantine/form";

// Define interfaces for module data from API
interface Promo {
  id: string;
  level: string;
  specialty: string;
}

interface PromoModule {
  id: string;
  moduleId: string;
  promoId: string;
  workload: number;
  promo: Promo;
  module: {
    id: string;
    name: string;
  };
  ongoing?: Array<{
    teacher: { id: string; lastname: string; firstname: string };
  }>;
  potential?: Array<{
    teacher: { id: string; lastname: string; firstname: string };
  }>;
  selected?: Array<{
    teacher: { id: string; lastname: string; firstname: string };
  }>;
}

interface ModuleFormData {
  name: string;
  promoId: string;
  workload: string; // Use string for form input
}

export default function ModulesPage() {
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [selectedModule, setSelectedModule] = useState<PromoModule | null>(
    null,
  );
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // tRPC hooks
  const utils = api.useUtils();
  const promosQuery = api.promos.getAll.useQuery();
  const modulesQuery = api.modules.getByPromo.useQuery(
    { promoId: selectedPromo?.id ?? "" },
    { enabled: !!selectedPromo },
  );

  // Mutations
  const createModuleMutation = api.modules.create.useMutation({
    onSuccess: () => {
      void utils.modules.invalidate();
      void utils.promoModules.invalidate();
      setCreateModal(false);
      createForm.reset();
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error creating module:", error);
      setLoading(false);
      alert(`Erreur lors de la création: ${error.message}`);
    },
  });

  const createPromoModuleMutation = api.promoModules.create.useMutation({
    onSuccess: () => {
      void utils.modules.invalidate();
      void utils.promoModules.invalidate();
    },
  });

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
      setSelectedModule(null);
      editForm.reset();
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error updating module:", error);
      setLoading(false);
      alert(`Erreur lors de la modification: ${error.message}`);
    },
  });

  // Forms
  const createForm = useForm<ModuleFormData>({
    initialValues: {
      name: "",
      promoId: "",
      workload: "",
    },
    validate: {
      name: (value) => (!value ? "Le nom du module est requis" : null),
      promoId: (value) => (!value ? "La promo est requise" : null),
      workload: (value) => {
        if (!value) return "La charge de travail est requise";
        const numValue = Number(value);
        return isNaN(numValue) || numValue <= 0
          ? "La charge de travail doit être supérieure à 0"
          : null;
      },
    },
  });

  const editForm = useForm<{ name: string; workload: string }>({
    initialValues: {
      name: "",
      workload: "",
    },
    validate: {
      name: (value) => (!value ? "Le nom du module est requis" : null),
      workload: (value) => {
        if (!value) return "La charge de travail est requise";
        const numValue = Number(value);
        return isNaN(numValue) || numValue <= 0
          ? "La charge de travail doit être supérieure à 0"
          : null;
      },
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
  const handlePromoSelect = (promo: Promo) => {
    setSelectedPromo(promo);
  };

  const handleEditClick = (module: PromoModule) => {
    setSelectedModule(module);
    editForm.setValues({
      name: module.module.name,
      workload: String(module.workload),
    });
    setEditModal(true);
  };

  const handleCreateSubmit = async (values: ModuleFormData) => {
    setLoading(true);
    try {
      const newModule = await createModuleMutation.mutateAsync({
        name: values.name,
      });
      await createPromoModuleMutation.mutateAsync({
        moduleId: newModule.id,
        promoId: values.promoId,
        workload: Number(values.workload),
      });
    } catch (error) {
      console.error("Failed to create module:", error);
      setLoading(false);
    }
  };

  const handleEditSubmit = async (values: {
    name: string;
    workload: string;
  }) => {
    if (!selectedModule) return;
    setLoading(true);
    try {
      // Update module name
      await updateModuleMutation.mutateAsync({
        id: selectedModule.module.id,
        name: values.name,
      });

      // Update workload
      await updatePromoModuleMutation.mutateAsync({
        id: selectedModule.id,
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
                📚 Gestion des Modules
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push("/modules/delete")}
                  className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                  🗑️ Supprimer des Modules
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
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                📋 Sélectionnez une Promo
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {promos.map((promo) => (
                  <button
                    key={promo.id}
                    onClick={() => handlePromoSelect(promo)}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      selectedPromo?.id === promo.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">
                      {promo.level} - {promo.specialty}
                    </div>
                    <div className="text-sm text-gray-500">
                      Cliquez pour voir les modules
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modules List */}
            {selectedPromo && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
                    📖 Modules de {selectedPromo.level} -{" "}
                    {selectedPromo.specialty}
                  </h2>
                  <button
                    onClick={() => {
                      createForm.setFieldValue("promoId", selectedPromo.id);
                      setCreateModal(true);
                    }}
                    className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                  >
                    ➕ Créer un Module
                  </button>
                </div>

                {modulesQuery.isLoading ? (
                  <div className="py-8 text-center">
                    <div className="text-lg">Chargement des modules...</div>
                  </div>
                ) : modules.length === 0 ? (
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
                      Aucun module trouvé
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                      Cliquez sur le bouton &quot;Créer un Module&quot;
                      ci-dessus pour créer votre premier module pour cette promo
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Nom du Module
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Charge de travail
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Relations enseignants
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {modules.map((promoModule) => (
                          <tr key={promoModule.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                              {promoModule.module.name}
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {promoModule.workload}h
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                {getRelationsCount(promoModule)} relation(s)
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditClick(promoModule)}
                                  className="text-blue-600 transition-colors hover:text-blue-900"
                                  disabled={loading}
                                >
                                  ✏️ Modifier
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => router.push(`/modules/delete`)}
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
            )}
          </div>
        </div>
      </div>

      {/* Create Module Modal */}
      {createModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
          <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  ➕ Créer un nouveau module
                </h3>
                <button
                  onClick={() => {
                    setCreateModal(false);
                    createForm.reset();
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

              <form
                onSubmit={createForm.onSubmit(handleCreateSubmit)}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Nom du Module
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...createForm.getInputProps("name")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ex: Programmation Web, Base de données..."
                    disabled={loading}
                  />
                  {createForm.errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="promoId"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Promo
                  </label>
                  {selectedPromo &&
                    createForm.values.promoId === selectedPromo.id && (
                      <div className="mb-2 rounded-md bg-blue-50 p-2">
                        <p className="text-sm text-blue-800">
                          ✓ Promo pré-sélectionnée: {selectedPromo.level} -{" "}
                          {selectedPromo.specialty}
                        </p>
                      </div>
                    )}
                  <select
                    id="promoId"
                    {...createForm.getInputProps("promoId")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="">Sélectionner une promo</option>
                    {promos.map((promo) => (
                      <option key={promo.id} value={promo.id}>
                        {promo.level} - {promo.specialty}
                      </option>
                    ))}
                  </select>
                  {createForm.errors.promoId && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.errors.promoId}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="workload"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Charge de travail (heures)
                  </label>
                  <input
                    type="number"
                    id="workload"
                    {...createForm.getInputProps("workload")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ex: 20, 30, 40..."
                    disabled={loading}
                    min="1"
                  />
                  {createForm.errors.workload && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.errors.workload}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModal(false);
                      createForm.reset();
                    }}
                    className="flex-1 rounded-md bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Création..." : "➕ Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Module Modal */}
      {editModal && selectedModule && (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
          <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  ✏️ Modifier le module
                </h3>
                <button
                  onClick={() => {
                    setEditModal(false);
                    setSelectedModule(null);
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
                  <strong>Module:</strong> {selectedModule.module.name}
                  <br />
                  <strong>Promo:</strong> {selectedModule.promo.level} -{" "}
                  {selectedModule.promo.specialty}
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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
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
                    htmlFor="edit-workload"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Charge de travail (heures)
                  </label>
                  <input
                    type="number"
                    id="edit-workload"
                    {...editForm.getInputProps("workload")}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
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

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditModal(false);
                      setSelectedModule(null);
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
