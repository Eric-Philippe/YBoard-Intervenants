"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";
import { formatLastConnected } from "~/lib/utils";

interface User {
  id: string;
  lastname: string;
  firstname: string;
  email: string;
  last_connected?: Date | null;
}

export default function DeleteUsersPage() {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(),
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // tRPC hooks
  const utils = api.useUtils();
  const usersQuery = api.users.getAll.useQuery();

  // Mutations
  const deleteUsersMutation = api.users.delete.useMutation({
    onSuccess: (data) => {
      void utils.users.invalidate();
      setDeletedCount(data.count);
      setSuccess(true);
      setSelectedUserIds(new Set());
      setShowConfirmModal(false);
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error deleting users:", error);
      setLoading(false);
      alert(`Erreur lors de la suppression: ${error.message}`);
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
  const handleUserToggle = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleSelectAll = () => {
    const allUserIds = users.map((user) => user.id);
    if (selectedUserIds.size === allUserIds.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(allUserIds));
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedUserIds.size === 0) return;

    setLoading(true);
    try {
      await deleteUsersMutation.mutateAsync(Array.from(selectedUserIds));
    } catch (error) {
      console.error("Failed to delete users:", error);
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

  // Show success modal
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
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
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Suppression réussie !
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  {deletedCount} utilisateur(s) supprimé(s) avec succès.
                </p>
                <div className="space-x-3">
                  <button
                    onClick={() => setSuccess(false)}
                    className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                  >
                    Continuer la suppression
                  </button>
                  <button
                    onClick={() => router.push("/users")}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    Retour aux utilisateurs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                🗑️ Supprimer des Utilisateurs
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push("/users")}
                  className="rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                >
                  Retour à la gestion
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Accueil
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
                  Il n&apos;y a aucun utilisateur à supprimer.
                </p>
                <button
                  onClick={() => router.push("/users")}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Retour à la gestion des utilisateurs
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Attention
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          ⚠️ La suppression d&apos;utilisateurs est{" "}
                          <strong>définitive</strong> et ne peut pas être
                          annulée. Assurez-vous de sélectionner uniquement les
                          utilisateurs que vous souhaitez réellement supprimer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedUserIds.size === users.length &&
                          users.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Sélectionner tout ({users.length})
                      </span>
                    </label>
                    {selectedUserIds.size > 0 && (
                      <span className="text-sm text-gray-500">
                        {selectedUserIds.size} utilisateur(s) sélectionné(s)
                      </span>
                    )}
                  </div>
                  {selectedUserIds.size > 0 && (
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                      disabled={loading}
                    >
                      🗑️ Supprimer ({selectedUserIds.size})
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                          <span className="sr-only">Sélection</span>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                          Dernière Connexion
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className={`hover:bg-gray-50 ${
                            selectedUserIds.has(user.id) ? "bg-red-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.has(user.id)}
                              onChange={() => handleUserToggle(user.id)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                          </td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
          <div className="relative top-20 mx-auto w-[500px] rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-red-900">
                  ⚠️ Confirmer la suppression
                </h3>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={loading}
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

              <div className="mb-4 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Action irréversible
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Vous êtes sur le point de supprimer{" "}
                        <strong>{selectedUserIds.size}</strong> utilisateur(s).
                        Cette action est définitive et ne peut pas être annulée.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 p-3">
                <h4 className="mb-2 text-sm font-medium text-gray-900">
                  Utilisateurs à supprimer :
                </h4>
                <ul className="space-y-1">
                  {users
                    .filter((user) => selectedUserIds.has(user.id))
                    .map((user) => (
                      <li key={user.id} className="text-sm text-gray-600">
                        • {user.firstname} {user.lastname} ({user.email})
                      </li>
                    ))}
                </ul>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 rounded-md bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Suppression..." : `🗑️ Confirmer la suppression`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
