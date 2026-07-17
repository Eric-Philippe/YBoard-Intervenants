"use client";

import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { Modal, Checkbox } from "@mantine/core";
import { api } from "~/trpc/react";
import { IconPlus, IconBook, IconTrash, IconShare2 } from "@tabler/icons-react";

const MAX_PROMOS_PER_MODULE = 3;

interface PromoLink {
  promoId: string;
  workload: string;
}

interface ModuleFormData {
  name: string;
  description: string;
  periode: string;
  avecMentor: boolean;
  nombreHeureTDP: string;
  nombreHeureFFP: string;
}

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialPromoId?: string;
}

export const CreateModuleModal: React.FC<CreateModuleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialPromoId,
}) => {
  const [loading, setLoading] = useState(false);
  const [promoLinks, setPromoLinks] = useState<PromoLink[]>([
    { promoId: "", workload: "" },
  ]);
  const [linkErrors, setLinkErrors] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialPromoId) {
      setPromoLinks((prev) => {
        const first = prev[0] ?? { promoId: "", workload: "" };
        if (first.promoId) return prev;
        return [{ ...first, promoId: initialPromoId }, ...prev.slice(1)];
      });
    }
  }, [isOpen, initialPromoId]);

  // tRPC hooks
  const utils = api.useUtils();
  const promosQuery = api.promos.getAll.useQuery();

  const createModuleMutation = api.modules.create.useMutation();
  const createPromoModuleMutation = api.promoModules.create.useMutation();

  // Form
  const form = useForm<ModuleFormData>({
    initialValues: {
      name: "",
      description: "",
      periode: "",
      avecMentor: false,
      nombreHeureTDP: "",
      nombreHeureFFP: "",
    },
    validate: {
      name: (value) => (!value ? "Le nom du module est requis" : null),
      description: (value) =>
        !value.trim()
          ? "La description est requise, elle alimente le sondage"
          : null,
    },
  });

  const promos = promosQuery.data ?? [];

  const resetAll = () => {
    form.reset();
    setPromoLinks([{ promoId: "", workload: "" }]);
    setLinkErrors(null);
  };

  const handleClose = () => {
    onClose();
    resetAll();
  };

  const updateLink = (index: number, patch: Partial<PromoLink>) => {
    setPromoLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    );
  };

  const addLinkRow = () => {
    if (promoLinks.length >= MAX_PROMOS_PER_MODULE) return;
    setPromoLinks((prev) => [...prev, { promoId: "", workload: "" }]);
  };

  const removeLinkRow = (index: number) => {
    setPromoLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const promoIdsAlreadyUsed = (excludeIndex: number) =>
    new Set(
      promoLinks
        .filter((_, i) => i !== excludeIndex)
        .map((l) => l.promoId)
        .filter(Boolean),
    );

  const handleSubmit = async (values: ModuleFormData) => {
    setLinkErrors(null);

    if (!promoLinks[0]?.promoId || !promoLinks[0]?.workload) {
      setLinkErrors("Choisissez au moins une promo et sa charge de travail.");
      return;
    }

    const filledLinks = promoLinks.filter((l) => l.promoId || l.workload);
    for (const link of filledLinks) {
      if (!link.promoId || !link.workload || Number(link.workload) <= 0) {
        setLinkErrors(
          "Chaque promo ajoutée doit avoir une charge de travail valide (> 0).",
        );
        return;
      }
    }
    const promoIds = filledLinks.map((l) => l.promoId);
    if (new Set(promoIds).size !== promoIds.length) {
      setLinkErrors("Une même promo ne peut pas être choisie deux fois.");
      return;
    }

    setLoading(true);
    try {
      const newModule = await createModuleMutation.mutateAsync({
        name: values.name,
        description: values.description,
        periode: values.periode || undefined,
        avecMentor: values.avecMentor,
        nombreHeureTDP: values.nombreHeureTDP
          ? Number(values.nombreHeureTDP)
          : undefined,
        nombreHeureFFP: values.nombreHeureFFP
          ? Number(values.nombreHeureFFP)
          : undefined,
      });

      for (const link of filledLinks) {
        await createPromoModuleMutation.mutateAsync({
          moduleId: newModule.id,
          promoId: link.promoId,
          workload: Number(link.workload),
        });
      }

      await Promise.all([
        utils.modules.invalidate(),
        utils.promoModules.invalidate(),
      ]);
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create module:", error);
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      setLinkErrors(`Erreur lors de la création : ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      withCloseButton={false}
      centered
      radius="lg"
      size="xl"
      overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
      classNames={{ content: "!bg-white/85 !backdrop-blur-2xl", body: "p-0" }}
    >
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span className="bg-brand-100 text-brand-600 flex h-8 w-8 items-center justify-center rounded-lg">
              <IconBook size={16} />
            </span>
            Créer un nouveau module
          </h3>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
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
              Nom du module
            </label>
            <input
              type="text"
              id="name"
              {...form.getInputProps("name")}
              className="input-glass"
              placeholder="Ex : Programmation Web, Base de données..."
              disabled={loading}
            />
            {form.errors.name && (
              <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              {...form.getInputProps("description")}
              className="input-glass"
              rows={3}
              placeholder="Objectifs et contenu du module, utilisés dans le sondage..."
              disabled={loading}
            />
            {form.errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {form.errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="periode"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Période (optionnel)
              </label>
              <input
                type="text"
                id="periode"
                {...form.getInputProps("periode")}
                className="input-glass"
                placeholder="Ex : Semestre 1"
                disabled={loading}
              />
            </div>
            <div className="flex items-end pb-2">
              <Checkbox
                label="Avec mentor"
                checked={form.values.avecMentor}
                onChange={(e) =>
                  form.setFieldValue("avecMentor", e.currentTarget.checked)
                }
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <IconShare2 size={14} className="text-brand-600" />
                Promo(s)
              </label>
              {promoLinks.length < MAX_PROMOS_PER_MODULE && (
                <button
                  type="button"
                  onClick={addLinkRow}
                  className="text-brand-600 hover:text-brand-800 flex items-center gap-1 text-xs font-medium"
                  disabled={loading}
                >
                  <IconPlus size={14} />
                  Mutualiser sur une autre promo
                </button>
              )}
            </div>
            <p className="mb-2 text-xs text-gray-500">
              Un même module peut être partagé entre {MAX_PROMOS_PER_MODULE}{" "}
              promos maximum (cours mutualisés).
            </p>

            <div className="space-y-2">
              {promoLinks.map((link, index) => {
                const usedElsewhere = promoIdsAlreadyUsed(index);
                return (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={link.promoId}
                      onChange={(e) =>
                        updateLink(index, { promoId: e.target.value })
                      }
                      className="input-glass flex-1"
                      disabled={loading}
                    >
                      <option value="">Sélectionner une promo</option>
                      {promos
                        .filter((p) => !usedElsewhere.has(p.id))
                        .map((promo) => (
                          <option key={promo.id} value={promo.id}>
                            {promo.level} - {promo.specialty}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={link.workload}
                      onChange={(e) =>
                        updateLink(index, { workload: e.target.value })
                      }
                      placeholder="Heures"
                      className="input-glass w-24"
                      disabled={loading}
                    />
                    {promoLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLinkRow(index)}
                        className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        disabled={loading}
                      >
                        <IconTrash size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {linkErrors && (
              <p className="mt-2 text-sm text-red-600">{linkErrors}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nombreHeureTDP"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nb heures TDP (optionnel)
              </label>
              <input
                type="number"
                min="1"
                id="nombreHeureTDP"
                {...form.getInputProps("nombreHeureTDP")}
                className="input-glass"
                placeholder="Ex : 10"
                disabled={loading}
              />
            </div>
            <div>
              <label
                htmlFor="nombreHeureFFP"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nb heures FFP (optionnel)
              </label>
              <input
                type="number"
                min="1"
                id="nombreHeureFFP"
                {...form.getInputProps("nombreHeureFFP")}
                className="input-glass"
                placeholder="Ex : 10"
                disabled={loading}
              />
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
