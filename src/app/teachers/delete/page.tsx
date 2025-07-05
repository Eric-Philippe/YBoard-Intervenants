"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";
import {
  DeletionWarning,
  TeachersList,
  DeleteConfirmationModal,
  SuccessModal,
} from "./components";
import type { Teacher, DeletionStats } from "./types";
import { getRelationsCount } from "./utils";

export default function DeleteTeachersPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [deletionResult, setDeletionResult] = useState<DeletionStats | null>(
    null,
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // tRPC hooks
  const utils = api.useUtils();
  const teachersQuery = api.teachers.getAll.useQuery();

  const deleteTeacherMutation = api.teachers.delete.useMutation({
    onSuccess: () => {
      const deletedTeacher = selectedTeacher!;
      const relationsCount = getRelationsCount(deletedTeacher);

      setDeletionResult({
        teacher: `${deletedTeacher.lastname} ${deletedTeacher.firstname}`,
        relationsCount,
      });

      void utils.teachers.invalidate();
      setDeleteModal(false);
      setSelectedTeacher(null);
      setLoading(false);
      setShowSuccessModal(true);
    },
    onError: (error) => {
      console.error("Error deleting teacher:", error);
      setLoading(false);
      alert(`Erreur lors de la suppression: ${error.message}`);
    },
  });

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

  const handleDeleteClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return;

    setLoading(true);
    try {
      await deleteTeacherMutation.mutateAsync({ id: selectedTeacher.id });
    } catch (error) {
      console.error("Failed to delete teacher:", error);
      setLoading(false);
    }
  };

  const toggleDetails = (teacherId: string) => {
    setShowDetails(showDetails === teacherId ? null : teacherId);
  };

  if (teachersQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (teachersQuery.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">Erreur lors du chargement</div>
      </div>
    );
  }

  const teachers = teachersQuery.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                🗑️ Suppression des Enseignants
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push("/teachers")}
                  className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                >
                  Gestion des Enseignants
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Retour à l&apos;accueil
                </button>
              </div>
            </div>

            <DeletionWarning />

            {/* Teachers List */}
            <TeachersList
              teachers={teachers}
              showDetails={showDetails}
              loading={loading}
              onToggleDetails={toggleDetails}
              onDeleteClick={handleDeleteClick}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && selectedTeacher && (
        <DeleteConfirmationModal
          teacher={selectedTeacher}
          loading={loading}
          onCancel={() => {
            setDeleteModal(false);
            setSelectedTeacher(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && deletionResult && (
        <SuccessModal
          deletionResult={deletionResult}
          onClose={() => {
            setShowSuccessModal(false);
            setDeletionResult(null);
          }}
        />
      )}
    </div>
  );
}
