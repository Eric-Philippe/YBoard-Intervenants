export default function DeletionWarning() {
  return (
    <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            ⚠️ Attention - Zone de suppression
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              La suppression d&apos;un enseignant est{" "}
              <strong>irréversible</strong> et supprimera automatiquement :
            </p>
            <ul className="mt-1 list-inside list-disc">
              <li>Toutes les informations personnelles</li>
              <li>
                Toutes les relations avec les modules (ongoing, potential,
                selected)
              </li>
              <li>
                Toutes les données liées à cet enseignant dans la base de
                données
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
