"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";
import { useForm } from "@mantine/form";
import { CoverageBar, RelationsHoverPreview } from "~/components";
import {
  LuBookOpen,
  LuCheck,
  LuClipboardList,
  LuLayers,
  LuLayoutGrid,
  LuPencil,
  LuPlus,
  LuSearch,
  LuSearchX,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import { getWorkloadStatusColor, getWorkloadStatusText } from "~/lib/utils";

// Define interfaces for module data from API
interface Promo {
  id: string;
  level: string;
  specialty: string;
  promoModules?: Array<{
    workload: number;
    module: {
      id: string;
      name: string;
    };
  }>;
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
    workload: number;
    teacher: { id: string; lastname: string; firstname: string };
  }>;
  potential?: Array<{
    workload: number;
    teacher: { id: string; lastname: string; firstname: string };
  }>;
  selected?: Array<{
    workload: number;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"name" | "workload" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
    setSearchTerm(""); // Reset search when changing promo
    setSortField(null); // Reset sort when changing promo
  };

  const handleSort = (field: "name" | "workload") => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field with ascending order
      setSortField(field);
      setSortDirection("asc");
    }
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

  // Coverage is based on "selected" teachers only, mirroring the details panel logic
  const getCoverage = (promoModule: PromoModule): number => {
    const selectedTotal =
      promoModule.selected?.reduce((total, rel) => total + rel.workload, 0) ??
      0;
    return promoModule.workload > 0
      ? Math.round((selectedTotal / promoModule.workload) * 10000) / 100
      : 0;
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <LuLayoutGrid className="h-6 w-6 text-blue-600" />
                Gestion des Modules
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push("/modules/delete")}
                  className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                  <LuTrash2 className="h-4 w-4" />
                  Supprimer des Modules
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
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
                <LuClipboardList className="h-5 w-5 text-blue-600" />
                Sélectionnez une Promo
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {promos.map((promo) => {
                  const totalWorkload = calculatePromoTotalWorkload(promo);
                  const moduleCount = promo.promoModules?.length ?? 0;

                  return (
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
              <div>
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
                    onClick={() => {
                      createForm.setFieldValue("promoId", selectedPromo.id);
                      setCreateModal(true);
                    }}
                    className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
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
                        className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-blue-500"
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
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            <button
                              onClick={() => handleSort("name")}
                              className="flex items-center space-x-1 transition-colors hover:text-gray-700"
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
                              className="flex items-center space-x-1 transition-colors hover:text-gray-700"
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
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredAndSortedModules.map((promoModule) => {
                          const coverage = getCoverage(promoModule);
                          return (
                            <tr
                              key={promoModule.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                                <button
                                  onClick={() => {
                                    router.push(
                                      `/modules/details?promoId=${promoModule.promo.id}&moduleId=${promoModule.id}`,
                                    );
                                  }}
                                  className="flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left font-medium transition-colors hover:text-blue-600 hover:underline"
                                >
                                  <LuBookOpen className="h-4 w-4 text-gray-400" />
                                  {promoModule.module.name}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                  {promoModule.workload}h
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                <div className="flex items-center gap-2">
                                  <div className="w-20">
                                    <CoverageBar coverage={coverage} size="sm" />
                                  </div>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${getWorkloadStatusColor(coverage)}`}
                                    title={getWorkloadStatusText(coverage)}
                                  >
                                    {coverage}%
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
                                    className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-900"
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
                                    className="flex items-center gap-1 text-red-600 transition-colors hover:text-red-900"
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
          </div>
        </div>
      </div>

      {/* Create Module Modal */}
      {createModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
          <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                  <LuPlus className="h-5 w-5 text-green-600" />
                  Créer un nouveau module
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
                      <div className="mb-2 flex items-center gap-2 rounded-md bg-blue-50 p-2">
                        <LuCheck className="h-4 w-4 text-blue-700" />
                        <p className="text-sm text-blue-800">
                          Promo pré-sélectionnée: {selectedPromo.level} -{" "}
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
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {!loading && <LuPlus className="h-4 w-4" />}
                    {loading ? "Création..." : "Créer"}
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
                <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                  <LuPencil className="h-5 w-5 text-blue-600" />
                  Modifier le module
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
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
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
    </div>
  );
}
