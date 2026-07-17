import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Modal } from "@mantine/core";
import {
  LuGraduationCap,
  LuGripVertical,
  LuTrash2,
  LuUser,
  LuUserCheck,
} from "react-icons/lu";
import type { TeacherRelation, TeacherStatus } from "../types";
import { getStatusColor, extractNumericRate } from "../utils";
import {
  calculateAssignationCost,
  getCalculationModeColor,
  getCalculationModeLabel,
} from "~/lib/utils";

interface DraggableTeacherProps {
  teacher: TeacherRelation;
  status: TeacherStatus;
  baseWorkload: number;
  moduleNombreHeureTDP?: number | null;
  moduleNombreHeureFFP?: number | null;
  onDelete: (teacherId: string, promoModulesId: string) => void;
  promoModulesId: string;
}

export function DraggableTeacher({
  teacher,
  status,
  baseWorkload,
  moduleNombreHeureTDP,
  moduleNombreHeureFFP,
  onDelete,
  promoModulesId,
}: DraggableTeacherProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${teacher.teacherId}-${status}`,
      data: {
        teacher,
        status,
      },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const teacherRate =
    teacher.teacher?.rate !== null && teacher.teacher?.rate !== undefined
      ? extractNumericRate(teacher.teacher.rate)
      : 0;

  const { cost: totalCost, mode: calculationMode } = calculateAssignationCost({
    workload: teacher.workload,
    rate: teacher.rate,
    rateTDP: teacher.rateTDP,
    rateFFP: teacher.rateFFP,
    teacherRate,
    moduleNombreHeureTDP,
    moduleNombreHeureFFP,
  });

  const effectiveRate =
    teacher.rate !== null && teacher.rate !== undefined
      ? Number(teacher.rate)
      : teacherRate;

  return (
    <>
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ease-out ${
        isDragging ? "z-50 shadow-lg" : "hover:bg-white/60"
      }`}
    >
      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
        <div
          className="flex cursor-move items-center"
          {...attributes}
          {...listeners}
        >
          <LuGripVertical className="mr-2 h-4 w-4 text-gray-400" />
          {status === "ongoing" && (
            <LuGraduationCap className="h-4 w-4 text-green-600" />
          )}
          {status === "potential" && (
            <LuUser className="h-4 w-4 text-orange-600" />
          )}
          {status === "selected" && (
            <LuUserCheck className="h-4 w-4 text-purple-600" />
          )}
          <span className="ml-2">
            {teacher.teacher.lastname} {teacher.teacher.firstname}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(status)}`}
        >
          {teacher.workload}h
        </span>
        {moduleNombreHeureTDP != null && moduleNombreHeureFFP != null && (
          <div className="mt-1 text-xs text-gray-400">
            TDP {moduleNombreHeureTDP}h / FFP {moduleNombreHeureFFP}h
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
        {calculationMode === "tdp_ffp" ? (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              TDP: {Number(teacher.rateTDP)}€/h
            </span>
            <span className="font-medium text-gray-900">
              FFP: {Number(teacher.rateFFP)}€/h
            </span>
          </div>
        ) : effectiveRate > 0 ? (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {effectiveRate}€/h
            </span>
            {teacher.rate !== undefined && teacher.rate !== null && (
              <span className="text-xs text-gray-400">
                (Spécifique au module)
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">N/A</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
        {totalCost > 0 ? (
          <div className="flex items-center gap-2">
            <span className="font-medium text-green-600">{totalCost}€</span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getCalculationModeColor(calculationMode)}`}
            >
              {getCalculationModeLabel(calculationMode)}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">N/A</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
        {((teacher.workload / baseWorkload) * 100).toFixed(1)}%
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
        <button
          onClick={handleDelete}
          className="rounded-full p-1 text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
          title="Supprimer cette relation"
        >
          <LuTrash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>

    <Modal
      opened={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      withCloseButton={false}
      centered
      radius="lg"
      size="sm"
      overlayProps={{ backgroundOpacity: 0.35, blur: 4 }}
      classNames={{ content: "!bg-white/90 !backdrop-blur-2xl", body: "p-0" }}
    >
      <div className="p-6">
        <h3 className="mb-2 text-base font-semibold text-gray-900">Retirer cet enseignant</h3>
        <p className="mb-5 text-sm text-gray-500">
          Retirer <strong>{teacher.teacher.firstname} {teacher.teacher.lastname}</strong> de la liste <strong>{status}</strong> ?
        </p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmOpen(false)} className="btn-secondary flex-1 justify-center">
            Annuler
          </button>
          <button
            onClick={() => { setConfirmOpen(false); onDelete(teacher.teacherId, promoModulesId); }}
            className="btn-danger flex-1 justify-center"
          >
            Retirer
          </button>
        </div>
      </div>
    </Modal>
    </>
  );
}
