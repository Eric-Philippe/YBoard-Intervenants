import type { DeletionStats } from "../types";

interface SuccessModalProps {
  deletionResult: DeletionStats;
  onClose: () => void;
}

export default function SuccessModal({
  deletionResult,
  onClose,
}: SuccessModalProps) {
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
      <div className="relative top-20 mx-auto w-[400px] rounded-md border bg-white p-5 shadow-lg">
        <div className="mt-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            ✅ Suppression réussie
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="mb-3 text-sm text-gray-700">
              L&apos;enseignant a été supprimé avec succès :
            </p>
            <div className="rounded-md bg-green-50 p-3">
              <p className="font-semibold text-green-900">
                👨‍🏫 {deletionResult.teacher}
              </p>
              <p className="mt-2 text-sm text-green-700">
                • {deletionResult.relationsCount} relation(s) supprimée(s)
                <br />• Informations personnelles supprimées
              </p>
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-green-700"
            >
              ✓ OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
