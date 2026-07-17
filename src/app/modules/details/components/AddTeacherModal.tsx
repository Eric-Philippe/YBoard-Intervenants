"use client";

import { useMemo, useState } from "react";
import { Modal, Select, NumberInput, Checkbox } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { api } from "~/trpc/react";
import {
  calculateAssignationCost,
  getCalculationModeColor,
  getCalculationModeLabel,
} from "~/lib/utils";
import { extractNumericRate } from "../utils";
import type { TeacherStatus } from "../types";

interface AddTeacherModalProps {
  opened: boolean;
  onClose: () => void;
  status: TeacherStatus;
  promoModulesId: string;
  moduleBaseWorkload: number;
  moduleNombreHeureTDP?: number | null;
  moduleNombreHeureFFP?: number | null;
  excludeTeacherIds: string[];
}

const statusLabels: Record<TeacherStatus, string> = {
  ongoing: "Ongoing",
  potential: "Potential",
  selected: "Selected",
};

export function AddTeacherModal({
  opened,
  onClose,
  status,
  promoModulesId,
  moduleBaseWorkload,
  moduleNombreHeureTDP,
  moduleNombreHeureFFP,
  excludeTeacherIds,
}: AddTeacherModalProps) {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [workload, setWorkload] = useState<number | "">(moduleBaseWorkload);
  const [rate, setRate] = useState<number | "">("");
  const [useCommonRate, setUseCommonRate] = useState(true);
  const [rateTDP, setRateTDP] = useState<number | "">("");
  const [rateFFP, setRateFFP] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = api.useUtils();
  const teachersQuery = api.teachers.getAll.useQuery(undefined, {
    enabled: opened,
  });

  const createOngoingMutation = api.relations.createOngoing.useMutation();
  const createPotentialMutation = api.relations.createPotential.useMutation();
  const createSelectedMutation = api.relations.createSelected.useMutation();

  const moduleSupportsSplit = !!(moduleNombreHeureTDP && moduleNombreHeureFFP);
  const splitMode = moduleSupportsSplit && !useCommonRate;

  const teachers = useMemo(
    () =>
      (teachersQuery.data ?? []).filter(
        (t) => !excludeTeacherIds.includes(t.id),
      ),
    [teachersQuery.data, excludeTeacherIds],
  );

  const selectedTeacher = teachers.find((t) => t.id === teacherId);
  const teacherDefaultRate = selectedTeacher
    ? extractNumericRate(selectedTeacher.rate)
    : 0;

  const resetAndClose = () => {
    setTeacherId(null);
    setWorkload(moduleBaseWorkload);
    setRate("");
    setUseCommonRate(true);
    setRateTDP("");
    setRateFFP("");
    onClose();
  };

  const handleRateModeToggle = (checked: boolean) => {
    setUseCommonRate(checked);
    if (checked) {
      setWorkload(moduleBaseWorkload);
    } else {
      setWorkload((moduleNombreHeureTDP ?? 0) + (moduleNombreHeureFFP ?? 0));
      const splitRate = teacherDefaultRate > 0 ? teacherDefaultRate : 45;
      setRateTDP(splitRate);
      setRateFFP(splitRate);
    }
  };

  const handleSubmit = async () => {
    if (!teacherId || typeof workload !== "number" || workload <= 0) {
      notifications.show({
        message:
          "Veuillez sélectionner un enseignant et une charge de travail valide.",
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

    setIsSubmitting(true);
    try {
      const data = splitMode
        ? {
            teacherId,
            promoModulesId,
            workload,
            rateTDP: rateTDP as number,
            rateFFP: rateFFP as number,
          }
        : {
            teacherId,
            promoModulesId,
            workload,
            rate: typeof rate === "number" && rate > 0 ? rate : undefined,
          };

      switch (status) {
        case "ongoing":
          await createOngoingMutation.mutateAsync(data);
          break;
        case "potential":
          await createPotentialMutation.mutateAsync(data);
          break;
        case "selected":
          await createSelectedMutation.mutateAsync(data);
          break;
      }

      await Promise.all([
        utils.modules.getByPromo.invalidate(),
        utils.promoModules.invalidate(),
      ]);
      resetAndClose();
    } catch (error) {
      console.error("Error adding teacher:", error);
      notifications.show({
        title: "Erreur",
        message: "Erreur lors de l'ajout de l'enseignant",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { cost, mode } = calculateAssignationCost({
    workload: typeof workload === "number" ? workload : 0,
    rate: splitMode ? undefined : typeof rate === "number" ? rate : undefined,
    rateTDP: splitMode ? rateTDP || undefined : undefined,
    rateFFP: splitMode ? rateFFP || undefined : undefined,
    teacherRate: teacherDefaultRate,
    moduleNombreHeureTDP,
    moduleNombreHeureFFP,
  });

  return (
    <Modal
      opened={opened}
      onClose={resetAndClose}
      title={`Ajouter un enseignant - ${statusLabels[status]}`}
      centered
      radius="lg"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Enseignant
          </label>
          <Select
            placeholder="Rechercher un enseignant..."
            searchable
            nothingFoundMessage="Aucun enseignant trouvé"
            data={teachers.map((t) => ({
              value: t.id,
              label: `${t.lastname} ${t.firstname}`,
            }))}
            value={teacherId}
            onChange={(value) => {
              setTeacherId(value);
              const teacher = teachers.find((t) => t.id === value);
              const defaultRate = teacher
                ? extractNumericRate(teacher.rate)
                : 0;
              setRate(defaultRate > 0 ? defaultRate : "");
              if (splitMode) {
                const splitRate = defaultRate > 0 ? defaultRate : 45;
                setRateTDP(splitRate);
                setRateFFP(splitRate);
              }
            }}
            disabled={teachersQuery.isLoading}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Charge de travail (heures)
          </label>
          <NumberInput
            min={1}
            value={workload}
            onChange={(value) =>
              setWorkload(typeof value === "number" ? value : "")
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Taux horaire (€/h)
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
            <NumberInput
              min={0}
              step={0.01}
              value={rate}
              onChange={(value) =>
                setRate(typeof value === "number" ? value : "")
              }
              placeholder={
                teacherDefaultRate > 0
                  ? `Taux par défaut: ${teacherDefaultRate}€/h`
                  : undefined
              }
            />
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
                    setRateTDP(typeof value === "number" ? value : "")
                  }
                  placeholder="Ex: 45€/h"
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
                    setRateFFP(typeof value === "number" ? value : "")
                  }
                  placeholder="Ex: 45€/h"
                />
              </div>
              <div className="col-span-2 text-xs text-gray-500">
                Module: {moduleNombreHeureTDP}h TDP / {moduleNombreHeureFFP}h
                FFP
              </div>
            </div>
          )}
        </div>

        {teacherId && (
          <div className="glass-panel flex items-center gap-2 rounded-md p-3 text-sm">
            <strong>Coût estimé:</strong> <span>{cost}€</span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getCalculationModeColor(mode)}`}
            >
              {getCalculationModeLabel(mode)}
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={resetAndClose}
            className="btn-secondary flex-1 justify-center"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary flex-1 justify-center"
            disabled={isSubmitting || !teacherId}
          >
            {isSubmitting ? "Ajout..." : "Ajouter"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
