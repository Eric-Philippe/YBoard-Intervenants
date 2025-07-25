export function EmptyState() {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-gray-100">
        <svg
          className="h-6 w-6 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-sm font-medium text-gray-900">
        Sélectionnez une promo
      </h3>
      <p className="text-sm text-gray-500">
        Choisissez une promo pour voir ses modules et pouvoir les supprimer
      </p>
    </div>
  );
}
