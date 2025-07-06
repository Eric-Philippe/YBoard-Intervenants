import { Modal, TextInput, Button, Group } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";

interface CreateUserModalProps {
  opened: boolean;
  onClose: () => void;
  userForm: UseFormReturnType<{
    firstname: string;
    lastname: string;
    email: string;
    password: string;
  }>;
  onSubmit: (values: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
  }) => Promise<void>;
}

export function CreateUserModal({
  opened,
  onClose,
  userForm,
  onSubmit,
}: CreateUserModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Créer un Nouvel Utilisateur"
    >
      <form onSubmit={userForm.onSubmit(onSubmit)}>
        <TextInput
          label="Prénom"
          placeholder="Entrez le prénom"
          required
          className="mb-4"
          {...userForm.getInputProps("firstname")}
        />
        <TextInput
          label="Nom"
          placeholder="Entrez le nom"
          required
          className="mb-4"
          {...userForm.getInputProps("lastname")}
        />
        <TextInput
          label="Email"
          placeholder="email@example.com"
          required
          className="mb-4"
          {...userForm.getInputProps("email")}
        />
        <TextInput
          label="Mot de passe"
          placeholder="Minimum 6 caractères"
          type="password"
          required
          className="mb-6"
          {...userForm.getInputProps("password")}
        />
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Créer
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
