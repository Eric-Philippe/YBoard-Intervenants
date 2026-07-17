import { useRouter } from "next/navigation";
import type { Teacher } from "~/types";
import {
  formatTeacherName,
  getStatusBadgeColor,
  getStatusLabel,
  formatRate,
} from "../utils";
import { IconUser } from "@tabler/icons-react";

interface TeacherDetailsHeaderProps {
  teacher: Teacher;
}

export function TeacherDetailsHeader({ teacher }: TeacherDetailsHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
          <IconUser size={28} />
          {formatTeacherName(teacher)}
        </h1>
        <div className="mt-2 flex items-center space-x-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeColor(teacher.status)}`}
          >
            {getStatusLabel(teacher.status)}
          </span>
          {teacher.rate && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {formatRate(teacher.rate)}
            </span>
          )}
        </div>
      </div>
      <div className="flex space-x-3">
        <button onClick={() => router.push("/teachers")} className="btn-secondary">
          Retour à la liste
        </button>
        <button onClick={() => router.push("/")} className="btn-glass">
          Retour à l&apos;accueil
        </button>
      </div>
    </div>
  );
}
