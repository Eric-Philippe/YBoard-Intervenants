"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { formatLastConnected } from "~/lib/utils";
import { IconUsers, IconPlus, IconTrash, IconPencil } from "@tabler/icons-react";

// Define interfaces for user data from API
interface User {
  id: string;
  lastname: string;
  firstname: string;
  email: string;
  last_connected?: Date | null;
}

interface UserFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

interface EditUserFormData {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
}

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // tRPC hooks
  const utils = api.useUtils();
  const usersQuery = api.users.getAll.useQuery();

  // Mutations
  const createUserMutation = api.users.create.useMutation({
    onSuccess: () => {
      void utils.users.invalidate();
      setCreateModal(false);
      createForm.reset();
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      setLoading(false);
      notifications.show({ title: "Erreur", message: `Erreur lors de la création : ${error.message}`, color: "red" });
    },
  });

  const updateUserMutation = api.users.update.useMutation({
    onSuccess: () => {
      void utils.users.invalidate();
      setEditModal(false);
      setSelectedUser(null);
      editForm.reset();
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      setLoading(false);
      notifications.show({ title: "Erreur", message: `Erreur lors de la modification : ${error.message}`, color: "red" });
    },
  });

  // Forms
  const createForm = useForm<UserFormData>({
    initialValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    },
    validate: {
      firstname: (value) => (!value ? "Le prénom est requis" : null),
      lastname: (value) => (!value ? "Le nom est requis" : null),
      email: (value) => {
        if (!value) return "L'email est requis";
        if (!/^\S+@\S+$/.test(value)) return "Email invalide";
        return null;
      },
      password: (value) => {
        if (!value) return "Le mot de passe est requis";
        if (value.length < 6)
          return "Le mot de passe doit contenir au moins 6 caractères";
        return null;
      },
    },
  });

  const editForm = useForm<EditUserFormData>({
    initialValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    },
    validate: {
      firstname: (value) => (!value ? "Le prénom est requis" : null),
      lastname: (value) => (!value ? "Le nom est requis" : null),
      email: (value) => {
        if (!value) return "L'email est requis";
        if (!/^\S+@\S+$/.test(value)) return "Email invalide";
        return null;
      },
      password: (value) => {
        if (value && value.length > 0 && value.length < 6) {
          return "Le mot de passe doit contenir au moins 6 caractères";
        }
        return null;
      },
    },
  });

  // Authentication check
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  // Event handlers
  const handleCreateClick = () => {
    createForm.reset();
    setCreateModal(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    editForm.setValues({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: "",
    });
    setEditModal(true);
  };

  const handleCreateSubmit = async (values: UserFormData) => {
    setLoading(true);
    try {
      await createUserMutation.mutateAsync(values);
    } catch (error) {
      console.error("Failed to create user:", error);
      setLoading(false);
    }
  };

  const handleEditSubmit = async (values: EditUserFormData) => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const updateData = {
        id: selectedUser.id,
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        ...(values.password &&
          values.password.trim() !== "" && { password: values.password }),
      };
      await updateUserMutation.mutateAsync(updateData);
    } catch (error) {
      console.error("Failed to update user:", error);
      setLoading(false);
    }
  };

  if (usersQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Chargement des utilisateurs...</div>
      </div>
    );
  }

  if (usersQuery.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">
          Erreur lors du chargement des utilisateurs
        </div>
      </div>
    );
  }

  const users: User[] = usersQuery.data ?? [];

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="glass-card">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <IconUsers size={24} />
                Gestion des Utilisateurs
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={handleCreateClick} className="btn-primary">
                  <IconPlus size={18} />
                  Créer un Utilisateur
                </button>
                <button onClick={() => router.push("/users/delete")} className="btn-danger">
                  <IconTrash size={18} />
                  Supprimer des Utilisateurs
                </button>
                <button onClick={() => router.push("/")} className="btn-glass">
                  Retour à l&apos;accueil
                </button>
              </div>
            </div>

            {users.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-sm font-medium text-gray-900">
                  Aucun utilisateur trouvé
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  Commencez par créer votre premier utilisateur
                </p>
                <button onClick={handleCreateClick} className="btn-primary">
                  <IconPlus size={18} />
                  Créer le premier utilisateur
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Dernière Connexion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-white/60">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                              <span className="text-sm font-medium text-blue-700">
                                {user.firstname.charAt(0)}
                                {user.lastname.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstname} {user.lastname}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            {user.email}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              user.last_connected
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {formatLastConnected(user.last_connected)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-900"
                              disabled={loading}
                            >
                              <IconPencil size={16} />
                              Modifier
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => router.push(`/users/delete`)}
                              className="flex items-center gap-1 text-red-600 transition-colors hover:text-red-900"
                              disabled={loading}
                            >
                              <IconTrash size={16} />
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-black/30 backdrop-blur-sm">
          <div className="glass-card relative top-20 mx-auto w-[620px] p-5">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                  <IconPlus size={18} />
                  Créer un nouvel utilisateur
                </h3>
                <button
                  onClick={() => {
                    setCreateModal(false);
                    createForm.reset();
                  }}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={createForm.onSubmit(handleCreateSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="lastname"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Nom *
                    </label>
                    <input
                      type="text"
                      id="lastname"
                      {...createForm.getInputProps("lastname")}
                      className="input-glass"
                      placeholder="Nom de famille"
                      disabled={loading}
                    />
                    {createForm.errors.lastname && (
                      <p className="mt-1 text-sm text-red-600">
                        {createForm.errors.lastname}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="firstname"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Prénom *
                    </label>
                    <input
                      type="text"
                      id="firstname"
                      {...createForm.getInputProps("firstname")}
                      className="input-glass"
                      placeholder="Prénom"
                      disabled={loading}
                    />
                    {createForm.errors.firstname && (
                      <p className="mt-1 text-sm text-red-600">
                        {createForm.errors.firstname}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...createForm.getInputProps("email")}
                    className="input-glass"
                    placeholder="email@example.com"
                    disabled={loading}
                  />
                  {createForm.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    id="password"
                    {...createForm.getInputProps("password")}
                    className="input-glass"
                    placeholder="Minimum 6 caractères"
                    disabled={loading}
                  />
                  {createForm.errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {createForm.errors.password}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModal(false);
                      createForm.reset();
                    }}
                    className="btn-secondary flex-1 justify-center"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      "Création..."
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <IconPlus size={16} />
                        Créer
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModal && selectedUser && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-black/30 backdrop-blur-sm">
          <div className="glass-card relative top-20 mx-auto w-[620px] p-5">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                  <IconPencil size={18} />
                  Modifier l&apos;utilisateur
                </h3>
                <button
                  onClick={() => {
                    setEditModal(false);
                    setSelectedUser(null);
                    editForm.reset();
                  }}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-4 rounded-md bg-brand-50 p-3">
                <p className="text-sm text-brand-800">
                  <strong>Utilisateur:</strong> {selectedUser.firstname}{" "}
                  {selectedUser.lastname}
                </p>
              </div>

              <form
                onSubmit={editForm.onSubmit(handleEditSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-lastname"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Nom *
                    </label>
                    <input
                      type="text"
                      id="edit-lastname"
                      {...editForm.getInputProps("lastname")}
                      className="input-glass"
                      placeholder="Nom de famille"
                      disabled={loading}
                    />
                    {editForm.errors.lastname && (
                      <p className="mt-1 text-sm text-red-600">
                        {editForm.errors.lastname}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="edit-firstname"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Prénom *
                    </label>
                    <input
                      type="text"
                      id="edit-firstname"
                      {...editForm.getInputProps("firstname")}
                      className="input-glass"
                      placeholder="Prénom"
                      disabled={loading}
                    />
                    {editForm.errors.firstname && (
                      <p className="mt-1 text-sm text-red-600">
                        {editForm.errors.firstname}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="edit-email"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    {...editForm.getInputProps("email")}
                    className="input-glass"
                    placeholder="email@example.com"
                    disabled={loading}
                  />
                  {editForm.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="edit-password"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Nouveau mot de passe (optionnel)
                  </label>
                  <input
                    type="password"
                    id="edit-password"
                    {...editForm.getInputProps("password")}
                    className="input-glass"
                    placeholder="Laisser vide pour conserver l'ancien"
                    disabled={loading}
                  />
                  {editForm.errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {editForm.errors.password}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditModal(false);
                      setSelectedUser(null);
                      editForm.reset();
                    }}
                    className="btn-secondary flex-1 justify-center"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      "Modification..."
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <IconPencil size={16} />
                        Modifier
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
