import { useRouter } from "next/navigation";
import type { Teacher } from "~/types";
import { formatTeacherName, getStatusBadgeColor, formatRate } from "../utils";

interface TeacherDetailsHeaderProps {
  teacher: Teacher;
}

export function TeacherDetailsHeader({ teacher }: TeacherDetailsHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          👨‍🏫 {formatTeacherName(teacher)}
        </h1>
        <div className="mt-2 flex items-center space-x-4">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeColor(teacher.status)}`}
          >
            {teacher.status ?? "Non spécifié"}
          </span>
          {teacher.rate && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {formatRate(teacher.rate)}
            </span>
          )}
        </div>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={() => router.push("/teachers")}
          className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
        >
          Retour à la liste
        </button>
        <button
          onClick={() => router.push("/")}
          className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    </div>
  );
}
