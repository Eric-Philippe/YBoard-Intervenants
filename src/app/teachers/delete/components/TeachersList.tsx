import type { Teacher } from "../types";
import TeacherCard from "./TeacherCard";
import EmptyState from "./EmptyState";
import { IconUsers } from "@tabler/icons-react";

interface TeachersListProps {
  teachers: Teacher[];
  showDetails: string | null;
  loading: boolean;
  onToggleDetails: (teacherId: string) => void;
  onDeleteClick: (teacher: Teacher) => void;
}

export default function TeachersList({
  teachers,
  showDetails,
  loading,
  onToggleDetails,
  onDeleteClick,
}: TeachersListProps) {
  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
        <IconUsers size={20} />
        Liste des Enseignants
      </h2>

      {teachers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              showDetails={showDetails === teacher.id}
              loading={loading}
              onToggleDetails={() => onToggleDetails(teacher.id)}
              onDeleteClick={() => onDeleteClick(teacher)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
