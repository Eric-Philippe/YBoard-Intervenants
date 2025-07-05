import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { PromoModule, TeacherRelation, WorkloadStats } from "../types";
import { DroppableZone } from "./DroppableZone";
import { DraggableTeacher } from "./DraggableTeacher";

interface TeacherManagementProps {
  selectedModule: PromoModule;
  stats: WorkloadStats;
  activeTeacher: TeacherRelation | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDeleteOngoing: (teacherId: string, promoModulesId: string) => void;
  onDeletePotential: (teacherId: string, promoModulesId: string) => void;
  onDeleteSelected: (teacherId: string, promoModulesId: string) => void;
}

export function TeacherManagement({
  selectedModule,
  stats,
  activeTeacher,
  onDragStart,
  onDragEnd,
  onDeleteOngoing,
  onDeletePotential,
  onDeleteSelected,
}: TeacherManagementProps) {
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="space-y-6">
        {/* Drag and Drop Instructions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                🤏 Glissez-Déposez pour réorganiser
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    <strong>Ongoing → Potential/Selected:</strong> Duplique
                    l&apos;enseignant (garde l&apos;original)
                  </li>
                  <li>
                    <strong>Potential ↔ Selected:</strong> Déplace
                    l&apos;enseignant (supprime l&apos;original)
                  </li>
                  <li>
                    <strong>Restrictions:</strong> Impossible de déplacer vers
                    Ongoing depuis Potential/Selected
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Ongoing Teachers */}
        <DroppableZone
          id="ongoing"
          title="Enseignants Ongoing"
          color="bg-green-500"
          count={selectedModule.ongoing?.length ?? 0}
        >
          {selectedModule.ongoing && selectedModule.ongoing.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Enseignant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Charge assignée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      % du module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {selectedModule.ongoing.map((relation) => (
                    <DraggableTeacher
                      key={`${relation.teacherId}-ongoing`}
                      teacher={relation}
                      status="ongoing"
                      baseWorkload={stats.baseWorkload}
                      onDelete={onDeleteOngoing}
                      promoModulesId={selectedModule.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              Aucun enseignant ongoing assigné
            </p>
          )}
        </DroppableZone>

        {/* Potential Teachers */}
        <DroppableZone
          id="potential"
          title="Enseignants Potential"
          color="bg-orange-500"
          count={selectedModule.potential?.length ?? 0}
        >
          {selectedModule.potential && selectedModule.potential.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Enseignant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Charge assignée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      % du module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {selectedModule.potential.map((relation) => (
                    <DraggableTeacher
                      key={`${relation.teacherId}-potential`}
                      teacher={relation}
                      status="potential"
                      baseWorkload={stats.baseWorkload}
                      onDelete={onDeletePotential}
                      promoModulesId={selectedModule.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              Aucun enseignant potential assigné
            </p>
          )}
        </DroppableZone>

        {/* Selected Teachers */}
        <DroppableZone
          id="selected"
          title="Enseignants Selected"
          color="bg-purple-500"
          count={selectedModule.selected?.length ?? 0}
        >
          {selectedModule.selected && selectedModule.selected.length > 0 ? (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Enseignant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Charge assignée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      % du module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {selectedModule.selected.map((relation) => (
                    <DraggableTeacher
                      key={`${relation.teacherId}-selected`}
                      teacher={relation}
                      status="selected"
                      baseWorkload={stats.baseWorkload}
                      onDelete={onDeleteSelected}
                      promoModulesId={selectedModule.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              Aucun enseignant selected assigné
            </p>
          )}
        </DroppableZone>
      </div>

      <DragOverlay>
        {activeTeacher ? (
          <div className="rounded-lg border-2 border-blue-300 bg-white p-4 shadow-xl">
            <div className="flex items-center">
              <span className="mr-2">🤏</span>
              <span className="font-medium">
                {activeTeacher.teacher.lastname}{" "}
                {activeTeacher.teacher.firstname}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                ({activeTeacher.workload}h)
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
