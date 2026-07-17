import { Title, Button } from "@mantine/core";

interface MainPageHeaderProps {
  onOpenPromoSelector: () => void;
}

export function MainPageHeader({ onOpenPromoSelector }: MainPageHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <Title order={1} className="text-gray-900">
        YBoard - Intervenants - Main Page
      </Title>
      <Button
        leftSection={
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        }
        variant="light"
        onClick={onOpenPromoSelector}
      >
        Sélectionner les promos
      </Button>
    </div>
  );
}
