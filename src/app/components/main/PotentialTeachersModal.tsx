import { Modal, Text, Button } from "@mantine/core";

interface PotentialTeachersModalProps {
  opened: boolean;
  onClose: () => void;
  selectedPotentialTeachers: Array<{
    teacher: { id: string; lastname: string; firstname: string };
  }>;
}

export function PotentialTeachersModal({
  opened,
  onClose,
  selectedPotentialTeachers,
}: PotentialTeachersModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Intervenants Potentiels"
      size="md"
    >
      <div className="space-y-3">
        {selectedPotentialTeachers.length > 0 ? (
          selectedPotentialTeachers.map((relation, index) => (
            <div
              key={`${relation.teacher.id}-${index}`}
              className="flex items-center rounded-lg border border-gray-200 p-3"
            >
              <div className="flex-1">
                <Text fw={500}>
                  {relation.teacher.lastname} {relation.teacher.firstname}
                </Text>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            Aucun intervenant potentiel
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onClose}>Fermer</Button>
      </div>
    </Modal>
  );
}
