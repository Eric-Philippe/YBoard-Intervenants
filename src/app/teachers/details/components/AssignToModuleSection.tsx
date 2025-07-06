"use client";

import { useState } from "react";
import { NumberInput } from "@mantine/core";
import { api } from "~/trpc/react";
import type { Teacher } from "~/types";
import type { RelationType } from "../types";

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
  const [isAssigning, setIsAssigning] = useState(false);

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
      alert(
        "Veuillez sélectionner une promo, un module, un statut et définir une charge de travail valide.",
      );
      return;
    }

    setIsAssigning(true);

    try {
      const finalRate = getNumericRate(rate);
      const assignmentData = {
        teacherId: teacher.id,
        promoModulesId: selectedModule.id,
        workload: workload,
        rate: finalRate > 0 ? finalRate : undefined,
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

      onAssignmentSuccess();
      alert("Enseignant assigné avec succès!");
    } catch (error) {
      console.error("Error assigning teacher:", error);
      alert("Erreur lors de l'assignation de l'enseignant");
    } finally {
      setIsAssigning(false);
    }
  };

  const statusOptions: { value: RelationType; label: string; color: string }[] =
    [
      {
        value: "ongoing",
        label: "🟢 Ongoing",
        color: "bg-green-100 text-green-800",
      },
      {
        value: "potential",
        label: "🟡 Potential",
        color: "bg-orange-100 text-orange-800",
      },
      {
        value: "selected",
        label: "🔵 Selected",
        color: "bg-blue-100 text-blue-800",
      },
    ];

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        ➕ Assigner à un Module
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
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                  className={`rounded-md border-2 px-3 py-2 text-sm font-medium transition-colors ${
                    selectedStatus === option.value
                      ? "border-blue-500 bg-blue-50"
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
          </div>
        )}

        {/* Assignment Summary */}
        {selectedPromo && selectedModule && selectedStatus && (
          <div className="rounded-md bg-gray-50 p-4">
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
              <div>
                <strong>Taux horaire:</strong>{" "}
                {rate && typeof rate === "number"
                  ? `${rate}€/h`
                  : teacher.rate
                    ? `${teacher.rate}€/h (par défaut)`
                    : "Non défini"}
              </div>
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
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isAssigning ? "Assignation en cours..." : "✅ Assigner l'enseignant"}
        </button>
      </div>
    </div>
  );
}
