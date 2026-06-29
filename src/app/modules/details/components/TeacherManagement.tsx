import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { LuGripVertical, LuInfo } from "react-icons/lu";
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
              <LuInfo className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="flex items-center gap-2 text-sm font-medium text-blue-800">
                <LuGripVertical className="h-4 w-4" />
                Glissez-Déposez pour réorganiser
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Enseignant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Charge assignée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Taux horaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Coût total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      % du module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Enseignant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Charge assignée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Taux horaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Coût total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      % du module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Enseignant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Charge assignée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Taux horaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Coût total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      % du module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
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
              <LuGripVertical className="mr-2 h-4 w-4 text-gray-400" />
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
