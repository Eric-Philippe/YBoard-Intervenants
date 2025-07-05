"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { api } from "~/trpc/react";

interface ModuleFormData {
  name: string;
  promoId: string;
  workload: string; // Use string for form input
}

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateModuleModal: React.FC<CreateModuleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  // tRPC hooks
  const utils = api.useUtils();
  const promosQuery = api.promos.getAll.useQuery();

  const createModuleMutation = api.modules.create.useMutation({
    onSuccess: () => {
      void utils.modules.invalidate();
      void utils.promoModules.invalidate();
    },
  });

  const createPromoModuleMutation = api.promoModules.create.useMutation({
    onSuccess: () => {
      void utils.modules.invalidate();
      void utils.promoModules.invalidate();
      onClose();
      form.reset();
      setLoading(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error creating module:", error);
      setLoading(false);
      alert(`Erreur lors de la création: ${error.message}`);
    },
  });

  // Form
  const form = useForm<ModuleFormData>({
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

  const handleSubmit = async (values: ModuleFormData) => {
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

  const handleClose = () => {
    onClose();
    form.reset();
  };

  if (!isOpen) return null;

  const promos = promosQuery.data ?? [];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={(e) => {
        // Fermer le modal si on clique sur le backdrop
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-md border bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              ➕ Créer un nouveau module
            </h3>
            <button
              onClick={handleClose}
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

          <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
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
                {...form.getInputProps("name")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: Programmation Web, Base de données..."
                disabled={loading}
              />
              {form.errors.name && (
                <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="promoId"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Promo
              </label>
              <select
                id="promoId"
                {...form.getInputProps("promoId")}
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
              {form.errors.promoId && (
                <p className="mt-1 text-sm text-red-600">
                  {form.errors.promoId}
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
                {...form.getInputProps("workload")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: 20, 30, 40..."
                disabled={loading}
                min="1"
              />
              {form.errors.workload && (
                <p className="mt-1 text-sm text-red-600">
                  {form.errors.workload}
                </p>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
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
  );
};
