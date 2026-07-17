"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { api } from "~/trpc/react";
import { IconPlus, IconSchool } from "@tabler/icons-react";
import { SPEC_ICONS } from "~/utils/categoryIcons";

interface PromoFormData {
  level: string;
  specialty: string;
  icon: string;
}

interface CreatePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LEVEL_OPTIONS = [
  { value: "B1", label: "Bachelor 1" },
  { value: "B2", label: "Bachelor 2" },
  { value: "B3", label: "Bachelor 3" },
  { value: "M1", label: "Master 1" },
  { value: "M2", label: "Master 2" },
];

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
      notifications.show({ title: "Erreur", message: `Erreur lors de la création : ${error.message}`, color: "red" });
    },
  });

  // Form
  const form = useForm<PromoFormData>({
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

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      withCloseButton={false}
      centered
      radius="lg"
      size="lg"
      overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
      classNames={{ content: "!bg-white/85 !backdrop-blur-2xl", body: "p-0" }}
    >
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <IconSchool size={16} />
            </span>
            Créer une nouvelle promo
          </h3>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <label htmlFor="level" className="mb-1 block text-sm font-medium text-gray-700">
              Niveau
            </label>
            <select
              id="level"
              {...form.getInputProps("level")}
              className="input-glass"
              disabled={loading}
            >
              <option value="">Sélectionner un niveau</option>
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {form.errors.level && (
              <p className="mt-1 text-sm text-red-600">{form.errors.level}</p>
            )}
          </div>

          <div>
            <label htmlFor="specialty" className="mb-1 block text-sm font-medium text-gray-700">
              Spécialité
            </label>
            <input
              type="text"
              id="specialty"
              {...form.getInputProps("specialty")}
              className="input-glass"
              placeholder="Ex : Informatique, Marketing..."
              disabled={loading}
            />
            {form.errors.specialty && (
              <p className="mt-1 text-sm text-red-600">{form.errors.specialty}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Icône (sondage)
            </label>
            <div className="grid grid-cols-8 gap-2">
              {Object.entries(SPEC_ICONS).map(([key, meta]) => {
                const Icon = meta.Icon;
                const selected = form.values.icon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    title={meta.label}
                    onClick={() => form.setFieldValue("icon", key)}
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

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
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
                "Création..."
              ) : (
                <>
                  <IconPlus size={18} />
                  Créer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
