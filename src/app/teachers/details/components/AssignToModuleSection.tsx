"use client";

import { useState } from "react";
import { NumberInput, Checkbox } from "@mantine/core";
import { api } from "~/trpc/react";
import type { Teacher } from "~/types";
import type { RelationType } from "../types";
import { IconCirclePlus, IconCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  calculateAssignationCost,
  getCalculationModeColor,
  getCalculationModeLabel,
} from "~/lib/utils";

interface Promo {
  id: string;
  level: string;
  specialty: string;
}

interface PromoModule {
  id: string;
  workload: number;
  module: {
    id: string;
    name: string;
    nombreHeureTDP?: number | null;
    nombreHeureFFP?: number | null;
  };
  promo: {
    id: string;
    level: string;
    specialty: string;
  };
}

interface AssignToModuleSectionProps {
  teacher: Teacher;
  onAssignmentSuccess: () => void;
}

export function AssignToModuleSection({
  teacher,
  onAssignmentSuccess,
}: AssignToModuleSectionProps) {
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const [selectedModule, setSelectedModule] = useState<PromoModule | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState<RelationType | null>(
    null,
  );
  const [workload, setWorkload] = useState<number | "">(1);
  const [rate, setRate] = useState<number | "">(""); // Add rate state
  const [useCommonRate, setUseCommonRate] = useState(true);
  const [rateTDP, setRateTDP] = useState<number | "">("");
  const [rateFFP, setRateFFP] = useState<number | "">("");
  const [isAssigning, setIsAssigning] = useState(false);

  const moduleSupportsSplit = !!(
    selectedModule?.module.nombreHeureTDP &&
    selectedModule?.module.nombreHeureFFP
  );
  const splitMode = moduleSupportsSplit && !useCommonRate;

  // Utility function to convert rate to number (similar to main page)
  const getNumericRate = (
    rateValue: number | string | null | undefined,
  ): number => {
    if (!rateValue) return teacher.rate ?? 0;
    return typeof rateValue === "number"
      ? rateValue
      : Number(rateValue.toString());
  };

  // tRPC hooks
  const utils = api.useUtils();
  const promosQuery = api.promos.getAll.useQuery();
  const modulesQuery = api.modules.getByPromo.useQuery(
    { promoId: selectedPromo?.id ?? "" },
    { enabled: !!selectedPromo },
  );

  // Mutation hooks
  const createOngoingMutation = api.relations.createOngoing.useMutation();
  const createPotentialMutation = api.relations.createPotential.useMutation();
  const createSelectedMutation = api.relations.createSelected.useMutation();

  const handlePromoSelect = (promo: Promo) => {
    setSelectedPromo(promo);
    setSelectedModule(null);
    setSelectedStatus(null);
  };

  const handleModuleSelect = (module: PromoModule) => {
    setSelectedModule(module);
    setSelectedStatus(null);
    setUseCommonRate(true);
    setRateTDP("");
    setRateFFP("");
    setWorkload(module.workload);
  };

  const handleRateModeToggle = (checked: boolean) => {
    setUseCommonRate(checked);
    if (!selectedModule) return;
    if (checked) {
      setWorkload(selectedModule.workload);
    } else {
      const tdpFfpTotal =
        (selectedModule.module.nombreHeureTDP ?? 0) +
        (selectedModule.module.nombreHeureFFP ?? 0);
      setWorkload(tdpFfpTotal);
      const splitRate = teacher.rate ? Number(teacher.rate) || 45 : 45;
      setRateTDP(splitRate);
      setRateFFP(splitRate);
    }
  };

  const handleStatusSelect = (status: RelationType) => {
    setSelectedStatus(status);
    // Set default rate from teacher when status is selected
    if (teacher.rate) {
      setRate(teacher.rate);
    }
  };

  const handleAssign = async () => {
    if (
      !selectedModule ||
      !selectedStatus ||
      typeof workload !== "number" ||
      workload <= 0
    ) {
      notifications.show({
        message:
          "Veuillez sélectionner une promo, un module, un statut et définir une charge de travail valide.",
        color: "orange",
      });
      return;
    }

    if (
      splitMode &&
      (typeof rateTDP !== "number" ||
        typeof rateFFP !== "number" ||
        rateTDP <= 0 ||
        rateFFP <= 0)
    ) {
      notifications.show({
        message:
          "Veuillez renseigner un taux TDP et un taux FFP valides (> 0).",
        color: "orange",
      });
      return;
    }

    setIsAssigning(true);

    try {
      const assignmentData = splitMode
        ? {
            teacherId: teacher.id,
            promoModulesId: selectedModule.id,
            workload: workload,
            rateTDP: rateTDP as number,
            rateFFP: rateFFP as number,
          }
        : {
            teacherId: teacher.id,
            promoModulesId: selectedModule.id,
            workload: workload,
            rate: getNumericRate(rate) > 0 ? getNumericRate(rate) : undefined,
          };

      switch (selectedStatus) {
        case "ongoing":
          await createOngoingMutation.mutateAsync(assignmentData);
          break;
        case "potential":
          await createPotentialMutation.mutateAsync(assignmentData);
          break;
        case "selected":
          await createSelectedMutation.mutateAsync(assignmentData);
          break;
      }

      // Invalidate teacher query to refresh data
      await utils.teachers.getById.invalidate({ id: teacher.id });

      // Reset form
      setSelectedPromo(null);
      setSelectedModule(null);
      setSelectedStatus(null);
      setWorkload("");
      setRate("");
      setRateTDP("");
      setRateFFP("");
      setUseCommonRate(true);

      onAssignmentSuccess();
      notifications.show({
        title: "Succès",
        message: "Enseignant assigné avec succès.",
        color: "green",
      });
    } catch (error) {
      console.error("Error assigning teacher:", error);
      notifications.show({
        title: "Erreur",
        message: "Erreur lors de l'assignation de l'enseignant",
        color: "red",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const statusOptions: { value: RelationType; label: string; color: string }[] =
    [
      {
        value: "ongoing",
        label: "Ongoing",
        color: "bg-green-100 text-green-800",
      },
      {
        value: "potential",
        label: "Potential",
        color: "bg-orange-100 text-orange-800",
      },
      {
        value: "selected",
        label: "Selected",
        color: "bg-blue-100 text-blue-800",
      },
    ];

  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        <IconCirclePlus size={20} />
        Assigner à un Module
      </h3>

      <div className="space-y-4">
        {/* Promo Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            1. Sélectionner une Promo
          </label>
          {promosQuery.isLoading ? (
            <div className="text-sm text-gray-500">
              Chargement des promos...
            </div>
          ) : promosQuery.error ? (
            <div className="text-sm text-red-500">
              Erreur lors du chargement des promos
            </div>
          ) : (
            <select
              value={selectedPromo?.id ?? ""}
              onChange={(e) => {
                const promo = promosQuery.data?.find(
                  (p) => p.id === e.target.value,
                );
                if (promo) handlePromoSelect(promo);
              }}
              className="input-glass"
            >
              <option value="">-- Choisir une promo --</option>
              {promosQuery.data?.map((promo) => (
                <option key={promo.id} value={promo.id}>
                  {promo.level} - {promo.specialty}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Module Selection */}
        {selectedPromo && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              2. Sélectionner un Module
            </label>
            {modulesQuery.isLoading ? (
              <div className="text-sm text-gray-500">
                Chargement des modules...
              </div>
            ) : modulesQuery.error ? (
              <div className="text-sm text-red-500">
                Erreur lors du chargement des modules
              </div>
            ) : (
              <select
                value={selectedModule?.id ?? ""}
                onChange={(e) => {
                  const foundModule = modulesQuery.data?.find(
                    (m) => m.id === e.target.value,
                  );
                  if (foundModule) handleModuleSelect(foundModule);
                }}
                className="input-glass"
              >
                <option value="">-- Choisir un module --</option>
                {modulesQuery.data?.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.module.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Status Selection */}
        {selectedModule && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              3. Sélectionner un Statut
            </label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusSelect(option.value)}
                  className={`rounded-md border-2 px-3 py-2 text-sm font-medium transition-all duration-200 ease-out ${
                    selectedStatus === option.value
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs ${option.color}`}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Workload Input */}
        {selectedStatus && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              4. Charge de travail (heures)
            </label>
            <NumberInput
              min={1}
              max={100}
              value={workload}
              onChange={(value) => {
                if (value === "" || value === undefined || value === null) {
                  setWorkload("");
                } else if (typeof value === "number") {
                  setWorkload(value);
                } else {
                  // Si c'est une string, on essaie de la convertir en number
                  const numValue = Number(value);
                  if (!isNaN(numValue)) {
                    setWorkload(numValue);
                  } else {
                    setWorkload("");
                  }
                }
              }}
              placeholder="Entrer la charge de travail"
              className="w-full"
              styles={{
                input: {
                  borderColor: "#d1d5db",
                  backgroundColor: "white",
                  fontSize: "14px",
                  "&:focus": {
                    borderColor: "#3b82f6",
                    boxShadow: "0 0 0 1px #3b82f6",
                  },
                },
              }}
            />
          </div>
        )}

        {/* Rate Input */}
        {selectedStatus && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              5. Taux horaire (€/h)
            </label>

            {moduleSupportsSplit && (
              <Checkbox
                label="Taux commun (standard)"
                checked={useCommonRate}
                onChange={(e) => handleRateModeToggle(e.currentTarget.checked)}
                className="mb-2"
              />
            )}

            {!splitMode ? (
              <>
                <NumberInput
                  min={0}
                  step={0.01}
                  value={rate}
                  onChange={(value) => {
                    if (value === "" || value === undefined || value === null) {
                      setRate("");
                    } else if (typeof value === "number") {
                      setRate(value);
                    } else {
                      // Si c'est une string, on essaie de la convertir en number
                      const numValue = Number(value);
                      if (!isNaN(numValue)) {
                        setRate(numValue);
                      } else {
                        setRate("");
                      }
                    }
                  }}
                  placeholder={`Taux par défaut: ${teacher.rate ?? 0}€/h`}
                  className="w-full"
                  styles={{
                    input: {
                      borderColor: "#d1d5db",
                      backgroundColor: "white",
                      fontSize: "14px",
                      "&:focus": {
                        borderColor: "#3b82f6",
                        boxShadow: "0 0 0 1px #3b82f6",
                      },
                    },
                  }}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {teacher.rate
                    ? `Le taux par défaut de l'enseignant est ${teacher.rate}€/h. Laissez vide pour utiliser cette valeur.`
                    : "Aucun taux par défaut défini pour cet enseignant."}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Taux TDP (€/h)
                  </label>
                  <NumberInput
                    min={0}
                    step={0.01}
                    value={rateTDP}
                    onChange={(value) =>
                      setRateTDP(
                        typeof value === "number"
                          ? value
                          : value === ""
                            ? ""
                            : Number(value) || "",
                      )
                    }
                    placeholder="Ex: 45€/h"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Taux FFP (€/h)
                  </label>
                  <NumberInput
                    min={0}
                    step={0.01}
                    value={rateFFP}
                    onChange={(value) =>
                      setRateFFP(
                        typeof value === "number"
                          ? value
                          : value === ""
                            ? ""
                            : Number(value) || "",
                      )
                    }
                    placeholder="Ex: 45€/h"
                    className="w-full"
                  />
                </div>
                <div className="col-span-2 text-xs text-gray-500">
                  Module: {selectedModule?.module.nombreHeureTDP}h TDP /{" "}
                  {selectedModule?.module.nombreHeureFFP}h FFP
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assignment Summary */}
        {selectedPromo && selectedModule && selectedStatus && (
          <div className="glass-panel rounded-md p-4">
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Résumé de l&apos;assignation:
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>
                <strong>Enseignant:</strong> {teacher.firstname}{" "}
                {teacher.lastname}
              </div>
              <div>
                <strong>Promo:</strong> {selectedPromo.level} -{" "}
                {selectedPromo.specialty}
              </div>
              <div>
                <strong>Module:</strong> {selectedModule.module.name}
              </div>
              <div>
                <strong>Statut:</strong>{" "}
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs ${
                    statusOptions.find((s) => s.value === selectedStatus)?.color
                  }`}
                >
                  {statusOptions.find((s) => s.value === selectedStatus)?.label}
                </span>
              </div>
              <div>
                <strong>Charge de travail:</strong>{" "}
                {typeof workload === "number" ? `${workload}h` : "À définir"}
              </div>
              {splitMode ? (
                <div>
                  <strong>Taux:</strong> TDP{" "}
                  {typeof rateTDP === "number" ? `${rateTDP}€/h` : "?"} / FFP{" "}
                  {typeof rateFFP === "number" ? `${rateFFP}€/h` : "?"}
                </div>
              ) : (
                <div>
                  <strong>Taux horaire:</strong>{" "}
                  {rate && typeof rate === "number"
                    ? `${rate}€/h`
                    : teacher.rate
                      ? `${teacher.rate}€/h (par défaut)`
                      : "Non défini"}
                </div>
              )}
              {(() => {
                const { cost, mode } = calculateAssignationCost({
                  workload: typeof workload === "number" ? workload : 0,
                  rate: splitMode
                    ? undefined
                    : getNumericRate(rate) || undefined,
                  rateTDP: splitMode ? rateTDP || undefined : undefined,
                  rateFFP: splitMode ? rateFFP || undefined : undefined,
                  teacherRate: teacher.rate,
                  moduleNombreHeureTDP: selectedModule.module.nombreHeureTDP,
                  moduleNombreHeureFFP: selectedModule.module.nombreHeureFFP,
                });
                return (
                  <div className="flex items-center gap-2">
                    <strong>Coût estimé:</strong> <span>{cost}€</span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getCalculationModeColor(mode)}`}
                    >
                      {getCalculationModeLabel(mode)}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAssign}
          disabled={
            !selectedPromo ||
            !selectedModule ||
            !selectedStatus ||
            typeof workload !== "number" ||
            workload <= 0 ||
            isAssigning
          }
          className="btn-primary w-full justify-center disabled:cursor-not-allowed"
        >
          {isAssigning ? (
            "Assignation en cours..."
          ) : (
            <>
              <IconCheck size={16} />
              Assigner l&apos;enseignant
            </>
          )}
        </button>
      </div>
    </div>
  );
}
