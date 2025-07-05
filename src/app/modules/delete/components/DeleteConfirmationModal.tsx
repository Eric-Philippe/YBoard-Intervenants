import type { ModuleWithPromoModules } from "../types";
import { getPromoModulesCount, getRelationsCount } from "../utils";

interface DeleteConfirmationModalProps {
  module: ModuleWithPromoModules;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({
  module,
  loading,
  onCancel,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="relative top-20 mx-auto w-[500px] rounded-md border bg-white p-5 shadow-lg">
        <div className="mt-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            ⚠️ Confirmer la suppression définitive
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="mb-3 text-sm text-gray-700">
              Vous êtes sur le point de supprimer définitivement le module :
            </p>
            <div className="mb-3 rounded-md bg-red-50 p-3">
              <p className="font-semibold text-red-900">📚 {module.name}</p>
              <p className="mt-2 text-sm text-red-700">
                • {getPromoModulesCount(module)} association(s) avec des promos
                <br />• {getRelationsCount(module)} relation(s) avec les
                enseignants
                <br />• Toutes les données liées dans la base de données
              </p>
            </div>
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm font-medium text-yellow-800">
                🚨 Cette action est IRRÉVERSIBLE !
              </p>
              <p className="mt-1 text-xs text-yellow-700">
                Toutes les données supprimées ne pourront pas être récupérées.
              </p>
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-md bg-gray-500 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-gray-600"
                disabled={loading}
              >
                ❌ Annuler
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "⏳ Suppression..." : "🗑️ Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
