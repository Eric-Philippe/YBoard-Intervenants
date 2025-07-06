"use client";

import { useState, useRef } from "react";
import { api } from "~/trpc/react";
import type { Teacher } from "~/types";

interface CvManagementProps {
  teacher: Teacher;
  onCvUpdate: () => void;
}

interface UploadResponse {
  success: boolean;
  filename: string;
  message: string;
  error?: string;
}

export function CvManagement({ teacher, onCvUpdate }: CvManagementProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateCvMutation = api.teachers.updateCv.useMutation();
  const deleteCvMutation = api.teachers.deleteCv.useMutation();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      alert("Seuls les fichiers PDF sont acceptés");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("La taille du fichier ne doit pas dépasser 5MB");
      return;
    }

    setUploading(true);

    try {
      // First, delete old CV if exists
      if (teacher.cv_filename) {
        await fetch(`/api/cv/${teacher.cv_filename}`, {
          method: "DELETE",
        });
      }

      // Upload new CV
      const formData = new FormData();
      formData.append("file", file);
      formData.append("teacherId", teacher.id);

      const response = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as UploadResponse;

      if (!response.ok) {
        throw new Error(result.error ?? "Erreur lors de l'upload");
      }

      // Update database
      await updateCvMutation.mutateAsync({
        teacherId: teacher.id,
        filename: result.filename,
      });

      onCvUpdate();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload du CV",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCv = async () => {
    if (!teacher.cv_filename) return;

    if (!confirm("Êtes-vous sûr de vouloir supprimer ce CV ?")) {
      return;
    }

    setDeleting(true);

    try {
      // Delete file from server
      await fetch(`/api/cv/${teacher.cv_filename}`, {
        method: "DELETE",
      });

      // Update database
      await deleteCvMutation.mutateAsync({
        teacherId: teacher.id,
      });

      onCvUpdate();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Erreur lors de la suppression du CV");
    } finally {
      setDeleting(false);
    }
  };

  const handleViewCv = () => {
    if (teacher.cv_filename) {
      window.open(`/api/cv/${teacher.cv_filename}`, "_blank");
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        Curriculum Vitae
      </h3>

      {teacher.cv_filename ? (
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="mr-2 h-5 w-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            CV disponible
            {teacher.cv_uploaded_at && (
              <span className="ml-2">
                (uploadé le{" "}
                {new Date(teacher.cv_uploaded_at).toLocaleDateString("fr-FR")})
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleViewCv}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-4 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            >
              <svg
                className="mr-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Voir
            </button>

            <label className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-4 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none">
              <svg
                className="mr-1 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Remplacer
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            <button
              onClick={handleDeleteCv}
              disabled={deleting}
              className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm leading-4 font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              {deleting ? (
                <svg
                  className="mr-1 h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="mr-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="mt-4">
            <p className="mb-2 text-sm text-gray-500">
              Aucun CV n&apos;a été uploadé pour cet enseignant
            </p>
            <label className="inline-flex cursor-pointer items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none">
              {uploading ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Upload en cours...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Uploader un CV (PDF)
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-gray-400">
              Fichiers PDF uniquement, 5MB maximum
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
