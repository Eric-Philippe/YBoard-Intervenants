"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { api } from "~/trpc/react";

interface PromoFormData {
  level: string;
  specialty: string;
}

interface CreatePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreatePromoModal: React.FC<CreatePromoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  // tRPC hooks
  const utils = api.useUtils();
  const createPromoMutation = api.promos.create.useMutation({
    onSuccess: () => {
      void utils.promos.invalidate();
      void utils.promoModules.invalidate();
      onClose();
      form.reset();
      setLoading(false);
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error creating promo:", error);
      setLoading(false);
      alert(`Erreur lors de la création: ${error.message}`);
    },
  });

  // Form
  const form = useForm<PromoFormData>({
    initialValues: {
      level: "",
      specialty: "",
    },
    validate: {
      level: (value) => (!value ? "Le niveau est requis" : null),
      specialty: (value) => (!value ? "La spécialité est requise" : null),
    },
  });

  const handleSubmit = async (values: PromoFormData) => {
    setLoading(true);
    try {
      await createPromoMutation.mutateAsync(values);
    } catch (error) {
      console.error("Failed to create promo:", error);
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  if (!isOpen) return null;

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
              ➕ Créer une nouvelle promo
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
                htmlFor="level"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Niveau
              </label>
              <select
                id="level"
                {...form.getInputProps("level")}
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
              {form.errors.level && (
                <p className="mt-1 text-sm text-red-600">{form.errors.level}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="specialty"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Spécialité
              </label>
              <input
                type="text"
                id="specialty"
                {...form.getInputProps("specialty")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Ex: Informatique, Marketing..."
                disabled={loading}
              />
              {form.errors.specialty && (
                <p className="mt-1 text-sm text-red-600">
                  {form.errors.specialty}
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
