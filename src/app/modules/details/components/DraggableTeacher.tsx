import { useDraggable } from "@dnd-kit/core";
import {
  LuGraduationCap,
  LuGripVertical,
  LuTrash2,
  LuUser,
  LuUserCheck,
} from "react-icons/lu";
import type { TeacherRelation, TeacherStatus } from "../types";
import { getStatusColor, extractNumericRate } from "../utils";

interface DraggableTeacherProps {
  teacher: TeacherRelation;
  status: TeacherStatus;
  baseWorkload: number;
  onDelete: (teacherId: string, promoModulesId: string) => void;
  promoModulesId: string;
}

export function DraggableTeacher({
  teacher,
  status,
  baseWorkload,
  onDelete,
  promoModulesId,
}: DraggableTeacherProps) {
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

    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${teacher.teacher.firstname} ${teacher.teacher.lastname} de la liste ${status} ?`;

    if (window.confirm(confirmMessage)) {
      onDelete(teacher.teacherId, promoModulesId);
    }
  };

  // Calculate rate and cost
  const getEffectiveRate = () => {
    // First check if there's a specific rate for this relation
    if (teacher.rate !== null && teacher.rate !== undefined) {
      return Number(teacher.rate);
    }
    // Fallback to teacher's default rate
    if (teacher.teacher?.rate !== null && teacher.teacher?.rate !== undefined) {
      return extractNumericRate(teacher.teacher.rate);
    }
    return 0;
  };

  const effectiveRate = getEffectiveRate();
  const totalCost = teacher.workload * effectiveRate;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${
        isDragging ? "z-50 shadow-lg" : "hover:shadow-md"
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
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
        {effectiveRate > 0 ? (
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
          <span className="font-medium text-green-600">
            {Math.round(totalCost * 100) / 100}€
          </span>
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
  );
}
