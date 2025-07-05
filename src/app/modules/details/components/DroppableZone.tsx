import { useDroppable } from "@dnd-kit/core";

interface DroppableZoneProps {
  id: string;
  title: string;
  children: React.ReactNode;
  color: string;
  count: number;
}

export function DroppableZone({
  id,
  title,
  children,
  color,
  count,
}: DroppableZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 flex items-center text-lg font-medium text-gray-900">
        <span className={`mr-2 h-3 w-3 rounded-full ${color}`}></span>
        {title} ({count})
        <span className="ml-2 text-sm text-gray-500">
          {id === "ongoing" && "🔵 Peut être dupliqué vers Potential/Selected"}
          {id === "potential" && "🟠 Peut être déplacé vers Selected"}
          {id === "selected" && "🟣 Peut être déplacé vers Potential"}
        </span>
      </h3>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] rounded-lg border-2 border-dashed p-4 transition-colors ${
          isOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
