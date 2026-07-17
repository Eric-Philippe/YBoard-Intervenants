import { Button } from "@mantine/core";

interface EmptyStateProps {
  onOpenPromoSelector: () => void;
}

export function EmptyState({ onOpenPromoSelector }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
      <div className="flex flex-col items-center">
        <svg
          className="mb-4 h-12 w-12 text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-medium text-yellow-800">
          Aucune promo sélectionnée
        </h3>
        <p className="mb-4 text-yellow-700">
          Cliquez sur le bouton &quot;Sélectionner les promos&quot; pour choisir
          quelles promos afficher.
        </p>
        <Button onClick={onOpenPromoSelector} variant="light" color="yellow">
          Sélectionner des promos
        </Button>
      </div>
    </div>
  );
}
