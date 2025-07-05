"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";
import { useForm } from "@mantine/form";
import { formatLastConnectedFull } from "~/lib/utils";

interface ProfileFormData {
  firstname: string;
  lastname: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { isAuthenticated, loading: authLoading, user, updateUser } = useAuth();
  const router = useRouter();

  // tRPC hooks
  const utils = api.useUtils();

  // Mutations
  const updateProfileMutation = api.users.updateProfile.useMutation({
    onSuccess: (updatedUser) => {
      // Update the user in the auth context
      if (updateUser && updatedUser) {
        updateUser(updatedUser);
      }
      void utils.users.invalidate();
      setEditMode(false);
      setChangePasswordMode(false);
      profileForm.reset();
      passwordForm.reset();
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      setLoading(false);
      alert(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });

  // Forms
  const profileForm = useForm<ProfileFormData>({
    initialValues: {
      firstname: user?.firstname ?? "",
      lastname: user?.lastname ?? "",
      email: user?.email ?? "",
    },
    validate: {
      firstname: (value) => (!value ? "Le prénom est requis" : null),
      lastname: (value) => (!value ? "Le nom est requis" : null),
      email: (value) => {
        if (!value) return "L'email est requis";
        if (!/^\S+@\S+$/.test(value)) return "Email invalide";
        return null;
      },
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      currentPassword: (value) =>
        !value ? "Le mot de passe actuel est requis" : null,
      newPassword: (value) => {
        if (!value) return "Le nouveau mot de passe est requis";
        if (value.length < 6)
          return "Le mot de passe doit contenir au moins 6 caractères";
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return "La confirmation du mot de passe est requise";
        if (value !== values.newPassword)
          return "Les mots de passe ne correspondent pas";
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

  if (!isAuthenticated || !user) {
    router.push("/login");
    return null;
  }

  // Event handlers
  const handleEditProfile = () => {
    profileForm.setValues({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    profileForm.reset();
  };

  const handleChangePassword = () => {
    setChangePasswordMode(true);
    passwordForm.reset();
  };

  const handleCancelPasswordChange = () => {
    setChangePasswordMode(false);
    passwordForm.reset();
  };

  const handleProfileSubmit = async (values: ProfileFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfileMutation.mutateAsync({
        id: user.id,
        ...values,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormData) => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfileMutation.mutateAsync({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Profil mis à jour avec succès !
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    👤 Mon Profil
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Gérez vos informations personnelles et votre sécurité
                  </p>
                </div>
                <button
                  onClick={() => router.push("/")}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Retour à l&apos;accueil
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Informations Personnelles
                </h2>
                {!editMode && (
                  <button
                    onClick={handleEditProfile}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                    disabled={loading}
                  >
                    ✏️ Modifier
                  </button>
                )}
              </div>

              {editMode ? (
                <form
                  onSubmit={profileForm.onSubmit(handleProfileSubmit)}
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
                        {...profileForm.getInputProps("lastname")}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        disabled={loading}
                      />
                      {profileForm.errors.lastname && (
                        <p className="mt-1 text-sm text-red-600">
                          {profileForm.errors.lastname}
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
                        {...profileForm.getInputProps("firstname")}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        disabled={loading}
                      />
                      {profileForm.errors.firstname && (
                        <p className="mt-1 text-sm text-red-600">
                          {profileForm.errors.firstname}
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
                      {...profileForm.getInputProps("email")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      disabled={loading}
                    />
                    {profileForm.errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileForm.errors.email}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 rounded-md bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                      disabled={loading}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? "Sauvegarde..." : "💾 Sauvegarder"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Nom
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.lastname}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Prénom
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.firstname}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Dernière connexion
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatLastConnectedFull(user.last_connected)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Password Change */}
          <div className="rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Sécurité
                  </h2>
                  <p className="text-sm text-gray-500">
                    Modifiez votre mot de passe pour sécuriser votre compte
                  </p>
                </div>
                {!changePasswordMode && (
                  <button
                    onClick={handleChangePassword}
                    className="rounded-md bg-orange-600 px-3 py-2 text-sm text-white transition-colors hover:bg-orange-700"
                    disabled={loading}
                  >
                    🔒 Changer le mot de passe
                  </button>
                )}
              </div>

              {changePasswordMode ? (
                <form
                  onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Mot de passe actuel *
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      {...passwordForm.getInputProps("currentPassword")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      disabled={loading}
                    />
                    {passwordForm.errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordForm.errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Nouveau mot de passe *
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      {...passwordForm.getInputProps("newPassword")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Minimum 6 caractères"
                      disabled={loading}
                    />
                    {passwordForm.errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordForm.errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Confirmer le nouveau mot de passe *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      {...passwordForm.getInputProps("confirmPassword")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                      disabled={loading}
                    />
                    {passwordForm.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordForm.errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancelPasswordChange}
                      className="flex-1 rounded-md bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                      disabled={loading}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-md bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading
                        ? "Modification..."
                        : "🔒 Changer le mot de passe"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-md bg-gray-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-800">
                        Mot de passe sécurisé
                      </h3>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          Votre mot de passe est actuellement sécurisé. Cliquez
                          sur &quot;Changer le mot de passe&quot; pour le
                          modifier.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
