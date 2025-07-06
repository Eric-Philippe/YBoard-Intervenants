import { useDraggable } from "@dnd-kit/core";
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
    if (teacher.rate !== null && teacher.rate !== undefined) {
      return teacher.rate;
    }
    if (teacher.teacher?.rate) {
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
          <span className="mr-2">🤏</span>
          {status === "ongoing" && "👨‍🏫"}
          {status === "potential" && "👤"}
          {status === "selected" && "✅"}
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
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
}
