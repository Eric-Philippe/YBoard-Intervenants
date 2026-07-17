import { useDroppable } from "@dnd-kit/core";
import { LuPlus } from "react-icons/lu";

interface DroppableZoneProps {
  id: string;
  title: string;
  children: React.ReactNode;
  color: string;
  count: number;
  onAddClick?: () => void;
}

export function DroppableZone({
  id,
  title,
  children,
  color,
  count,
  onAddClick,
}: DroppableZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center text-lg font-medium text-gray-900">
          <span className={`mr-2 h-3 w-3 rounded-full ${color}`}></span>
          {title} ({count})
          <span className="ml-2 text-sm text-gray-500">
            {id === "ongoing" && "Peut être dupliqué vers Potential/Selected"}
            {id === "potential" && "Peut être déplacé vers Selected"}
            {id === "selected" && "Peut être déplacé vers Potential"}
          </span>
        </h3>
        {onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            className="btn-glass flex items-center gap-1 text-sm"
          >
            <LuPlus className="h-4 w-4" />
            Ajouter un enseignant
          </button>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] rounded-lg border-2 border-dashed p-4 transition-all duration-200 ease-out ${
          isOver
            ? "border-brand-500 bg-brand-50/70"
            : "border-gray-300 bg-white/40"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
