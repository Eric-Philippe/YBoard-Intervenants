"use client";

import { useState } from "react";
import { Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { LuShare2, LuX, LuPlus, LuTrash2, LuUsers } from "react-icons/lu";
import { api } from "~/trpc/react";

// Constants
const MAX_PROMOS_PER_MODULE = 3;

interface MutualizeModuleModalProps {
  moduleId: string;
  moduleName: string;
  onClose: () => void;
}

export function MutualizeModuleModal({
  moduleId,
  moduleName,
  onClose,
}: MutualizeModuleModalProps) {
  const utils = api.useUtils();
  const [selectedPromoId, setSelectedPromoId] = useState("");
  const [workload, setWorkload] = useState("");
  const [pendingRemove, setPendingRemove] = useState<{
    linkId: string;
    promoLabel: string;
  } | null>(null);

  const { data, isLoading } = api.modules.getMutualization.useQuery({
    moduleId,
  });
  const { data: allPromos = [] } = api.promos.getAll.useQuery();

  const links = data?.links ?? [];
  const linkedPromoIds = new Set(links.map((l) => l.promoId));
  const availablePromos = allPromos.filter((p) => !linkedPromoIds.has(p.id));
  const remainingSlots = MAX_PROMOS_PER_MODULE - links.length;

  const invalidate = () =>
    Promise.all([
      utils.modules.getMutualization.invalidate({ moduleId }),
      utils.modules.getMutualizationCounts.invalidate(),
      utils.modules.getByPromo.invalidate(),
      utils.promoModules.invalidate(),
    ]);

  const addMutation = api.promoModules.create.useMutation({
    onSuccess: async () => {
      await invalidate();
      setSelectedPromoId("");
      setWorkload("");
      notifications.show({
        message: "Promo ajoutee a la mutualisation",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        message: `Erreur : ${error.message}`,
        color: "red",
      });
    },
  });

  const removeMutation = api.promoModules.delete.useMutation({
    onSuccess: async () => {
      await invalidate();
      notifications.show({
        message: "Promo retiree, les reponses au sondage sont conservees",
        color: "blue",
      });
    },
    onError: (error) => {
      notifications.show({
        message: `Erreur : ${error.message}`,
        color: "red",
      });
    },
  });

  const handleAdd = () => {
    const workloadNum = Number(workload);
    if (!selectedPromoId || !workloadNum || workloadNum <= 0) return;
    addMutation.mutate({
      moduleId,
      promoId: selectedPromoId,
      workload: workloadNum,
    });
  };

  const handleRemove = (linkId: string, promoLabel: string) => {
    setPendingRemove({ linkId, promoLabel });
  };

  return (
    <>
      <Modal
        opened
        onClose={onClose}
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
              <span className="bg-brand-100 text-brand-600 flex h-8 w-8 items-center justify-center rounded-lg">
                <LuShare2 size={16} />
              </span>
              Mutualiser {moduleName}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <LuX size={18} />
            </button>
          </div>

          <p className="mb-4 text-sm text-gray-500">
            Partagez ce module entre {MAX_PROMOS_PER_MODULE} promos maximum
            (cours en commun, classes mutualisees). Retirer une promo ne
            supprime jamais les reponses au sondage deja recues pour ce module :
            elles restent visibles comme reponses orphelines.
          </p>

          {isLoading ? (
            <div className="py-6 text-center text-sm text-gray-400">
              Chargement...
            </div>
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                <LuUsers size={14} />
                Promos rattachees ({links.length}/{MAX_PROMOS_PER_MODULE})
              </div>
              <div className="mb-4 space-y-2">
                {links.length === 0 ? (
                  <div className="glass-panel rounded-lg p-3 text-sm text-gray-400">
                    Aucune promo rattachee.
                  </div>
                ) : (
                  links.map((link) => (
                    <div
                      key={link.id}
                      className="glass-panel flex items-center justify-between rounded-lg px-3 py-2"
                    >
                      <div className="text-sm">
                        <span className="font-medium text-gray-800">
                          {link.promo.level} - {link.promo.specialty}
                        </span>
                        <span className="ml-2 text-xs text-gray-400">
                          {link.workload}h
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleRemove(
                            link.id,
                            `${link.promo.level} - ${link.promo.specialty}`,
                          )
                        }
                        disabled={removeMutation.isPending}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <LuTrash2 size={13} />
                        Retirer
                      </button>
                    </div>
                  ))
                )}
              </div>

              {remainingSlots > 0 ? (
                availablePromos.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Aucune autre promo disponible dans ce périmètre.
                  </p>
                ) : (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      Ajouter une promo
                    </div>
                    <div className="flex items-end gap-2">
                      <select
                        value={selectedPromoId}
                        onChange={(e) => setSelectedPromoId(e.target.value)}
                        className="input-glass flex-1"
                      >
                        <option value="">Sélectionner une promo</option>
                        {availablePromos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.level} - {p.specialty}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={workload}
                        onChange={(e) => setWorkload(e.target.value)}
                        placeholder="Heures"
                        className="input-glass w-24"
                      />
                      <button
                        onClick={handleAdd}
                        disabled={
                          addMutation.isPending || !selectedPromoId || !workload
                        }
                        className="btn-primary shrink-0"
                      >
                        <LuPlus size={16} />
                        Ajouter
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <p className="border-t border-gray-100 pt-4 text-sm text-gray-400">
                  Nombre maximum de promos atteint pour ce module.
                </p>
              )}

              <div className="mt-5 flex justify-end">
                <button onClick={onClose} className="btn-secondary">
                  Fermer
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        opened={!!pendingRemove}
        onClose={() => setPendingRemove(null)}
        withCloseButton={false}
        centered
        radius="lg"
        size="sm"
        overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
        classNames={{ content: "!bg-white/90 !backdrop-blur-2xl", body: "p-0" }}
      >
        {pendingRemove && (
          <div className="p-6">
            <h3 className="mb-2 text-base font-semibold text-gray-900">
              Retirer de la promo
            </h3>
            <p className="mb-1 text-sm text-gray-700">
              Retirer <strong>{moduleName}</strong> de la promo{" "}
              <strong>{pendingRemove.promoLabel}</strong> ?
            </p>
            <p className="mb-5 text-xs text-gray-400">
              Les affectations d&apos;enseignants pour cette promo seront
              supprimées, mais les réponses au sondage déjà reçues restent
              conservées.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingRemove(null)}
                className="btn-secondary flex-1 justify-center"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  removeMutation.mutate({ id: pendingRemove.linkId });
                  setPendingRemove(null);
                }}
                className="btn-danger flex-1 justify-center"
              >
                Retirer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
