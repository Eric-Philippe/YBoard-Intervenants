"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";
import {
  TeacherDetailsHeader,
  TeacherSidebar,
  RelationsGrid,
  AssignToModuleSection,
  CvManagement,
} from "./components";
import type { Teacher } from "~/types";
import { calculateTeacherStatistics } from "./utils";

// Convert API response to our Teacher type
const convertApiTeacherToTeacher = (apiTeacher: unknown): Teacher => {
  const teacher = apiTeacher as Teacher & {
    status: string | null;
    diploma: string | null;
    comments: string | null;
    rate: number | null;
    email_perso: string | null;
    email_ynov: string | null;
    phone_number: string | null;
    cv_filename: string | null;
    cv_uploaded_at: Date | null;
  };

  return {
    ...teacher,
    status: teacher.status ?? undefined,
    diploma: teacher.diploma ?? undefined,
    comments: teacher.comments ?? undefined,
    rate: teacher.rate ?? undefined,
    email_perso: teacher.email_perso ?? undefined,
    email_ynov: teacher.email_ynov ?? undefined,
    phone_number: teacher.phone_number ?? undefined,
    cv_filename: teacher.cv_filename ?? undefined,
    cv_uploaded_at: teacher.cv_uploaded_at ?? undefined,
  };
};

function TeacherDetailsContent() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const teacherId = searchParams.get("id");

  // tRPC hooks
  const utils = api.useUtils();
  const teacherQuery = api.teachers.getById.useQuery(
    { id: teacherId ?? "" },
    { enabled: !!teacherId },
  );

  const handleAssignmentSuccess = async () => {
    if (teacherId) {
      await utils.teachers.getById.invalidate({ id: teacherId });
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (teacherQuery.data) {
      setTeacher(convertApiTeacherToTeacher(teacherQuery.data));
    }
    setLoading(teacherQuery.isLoading);
  }, [teacherQuery.data, teacherQuery.isLoading]);

  // Authentication check
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (!teacherId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">ID enseignant manquant</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">
          Chargement des détails de l&apos;enseignant...
        </div>
      </div>
    );
  }

  if (teacherQuery.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">
          Erreur lors du chargement: {teacherQuery.error.message}
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">Enseignant non trouvé</div>
      </div>
    );
  }

  const statistics = calculateTeacherStatistics(teacher);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <TeacherDetailsHeader teacher={teacher} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6">
                <TeacherSidebar teacher={teacher} statistics={statistics} />
                <CvManagement
                  teacher={teacher}
                  onCvUpdate={handleAssignmentSuccess}
                />
                <AssignToModuleSection
                  teacher={teacher}
                  onAssignmentSuccess={handleAssignmentSuccess}
                />
              </div>
              <div className="lg:col-span-2">
                <RelationsGrid teacher={teacher} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Chargement...</div>
        </div>
      }
    >
      <TeacherDetailsContent />
    </Suspense>
  );
}
