import { Modal, Button, Badge } from "@mantine/core";
import type { GroupedData } from "./types";

interface PromoSelectionModalProps {
  opened: boolean;
  onClose: () => void;
  groupedData: GroupedData;
  selectedPromos: Set<string>;
  onTogglePromoSelection: (promoName: string, isSelected: boolean) => void;
  onSelectAllPromos: () => void;
  onDeselectAllPromos: () => void;
}

export function PromoSelectionModal({
  opened,
  onClose,
  groupedData,
  selectedPromos,
  onTogglePromoSelection,
  onSelectAllPromos,
  onDeselectAllPromos,
}: PromoSelectionModalProps) {
  const isPromoSelected = (promoName: string) => {
    return selectedPromos.has(promoName);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Sélectionner les promos à afficher"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="xs"
            variant="light"
            color="green"
            onClick={onSelectAllPromos}
          >
            Tout sélectionner
          </Button>
          <Button
            size="xs"
            variant="light"
            color="red"
            onClick={onDeselectAllPromos}
          >
            Tout désélectionner
          </Button>
        </div>

        <div className="max-h-80 space-y-2 overflow-y-auto">
          {Object.entries(groupedData).map(([promoName, items]) => (
            <div
              key={promoName}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`promo-${promoName}`}
                  checked={isPromoSelected(promoName)}
                  onChange={(e) =>
                    onTogglePromoSelection(promoName, e.target.checked)
                  }
                  className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`promo-${promoName}`}
                  className="cursor-pointer font-medium text-gray-900"
                >
                  {promoName}
                </label>
              </div>
              <Badge color="gray" size="sm">
                {items.length} module{items.length > 1 ? "s" : ""}
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </Modal>
  );
}
