"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { api } from "~/trpc/react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconUsers,
  IconPlus,
  IconTrash,
  IconEye,
  IconPencil,
  IconPhone,
  IconFilter,
  IconX,
} from "@tabler/icons-react";

// Define interfaces for teacher data from API
interface Teacher {
  id: string;
  lastname: string;
  firstname: string;
  status?: string | null;
  diploma?: string | null;
  rate?: number | null;
  email_perso?: string | null;
  email_ynov?: string | null;
  phone_number?: string | null;
  ongoing?: Array<{
    promoModules: {
      module: { name: string };
      promo: { level: string; specialty: string };
    };
  }>;
  potential?: Array<{
    promoModules: {
      module: { name: string };
      promo: { level: string; specialty: string };
    };
  }>;
  selected?: Array<{
    promoModules: {
      module: { name: string };
      promo: { level: string; specialty: string };
    };
  }>;
}

interface TeacherFormData {
  firstname: string;
  lastname: string;
  status?: string;
  diploma?: string;
  rate?: string; // Use string for form input
  email_perso?: string;
  email_ynov?: string;
  phone_number?: string;
}

export default function TeachersPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [rateMin, setRateMin] = useState("");
  const [rateMax, setRateMax] = useState("");
  const [relationsFilter, setRelationsFilter] = useState<
    "all" | "with" | "without"
  >("all");
  const [diplomaFilter, setDiplomaFilter] = useState("");

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // tRPC hooks
  const utils = api.useUtils();
  const teachersQuery = api.teachers.getAll.useQuery();

  // Mutations
  const createTeacherMutation = api.teachers.create.useMutation({
    onSuccess: () => {
      void utils.teachers.invalidate();
      setCreateModal(false);
      createForm.reset();
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error creating teacher:", error);
      setLoading(false);
      notifications.show({
        title: "Erreur",
        message: `Erreur lors de la création : ${error.message}`,
        color: "red",
      });
    },
  });

  const updateTeacherMutation = api.teachers.update.useMutation({
    onSuccess: () => {
      void utils.teachers.invalidate();
      setEditModal(false);
      setSelectedTeacher(null);
      editForm.reset();
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error updating teacher:", error);
      setLoading(false);
      notifications.show({
        title: "Erreur",
        message: `Erreur lors de la modification : ${error.message}`,
        color: "red",
      });
    },
  });

  // Forms
  const createForm = useForm<TeacherFormData>({
    initialValues: {
      firstname: "",
      lastname: "",
      status: "",
      diploma: "",
      rate: "", // Use empty string to avoid controlled/uncontrolled warning
      email_perso: "",
      email_ynov: "",
      phone_number: "",
    },
    validate: {
      firstname: (value) => (!value ? "Le prénom est requis" : null),
      lastname: (value) => (!value ? "Le nom est requis" : null),
      rate: (value) => {
        if (!value) return null; // Empty is valid
        const numValue = Number(value);
        return isNaN(numValue) || numValue < 0 || numValue > 1000
          ? "Le tarif doit être entre 0 et 1000€"
          : null;
      },
      email_perso: (value) =>
        value && !/^\S+@\S+$/.test(value) ? "Email personnel invalide" : null,
      email_ynov: (value) =>
        value && !/^\S+@\S+$/.test(value) ? "Email Ynov invalide" : null,
    },
  });

  const editForm = useForm<TeacherFormData>({
    initialValues: {
      firstname: "",
      lastname: "",
      status: "",
      diploma: "",
      rate: "", // Use empty string to avoid controlled/uncontrolled warning
      email_perso: "",
      email_ynov: "",
      phone_number: "",
    },
    validate: {
      firstname: (value) => (!value ? "Le prénom est requis" : null),
      lastname: (value) => (!value ? "Le nom est requis" : null),
      rate: (value) => {
        if (!value) return null; // Empty is valid
        const numValue = Number(value);
        return isNaN(numValue) || numValue < 0 || numValue > 1000
          ? "Le tarif doit être entre 0 et 1000€"
          : null;
      },
      email_perso: (value) =>
        value && !/^\S+@\S+$/.test(value) ? "Email personnel invalide" : null,
      email_ynov: (value) =>
        value && !/^\S+@\S+$/.test(value) ? "Email Ynov invalide" : null,
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

  const handleEditClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    editForm.setValues({
      firstname: teacher.firstname,
      lastname: teacher.lastname,
      status: teacher.status ?? "",
      diploma: teacher.diploma ?? "",
      rate: teacher.rate ? String(teacher.rate) : "",
      email_perso: teacher.email_perso ?? "",
      email_ynov: teacher.email_ynov ?? "",
      phone_number: teacher.phone_number ?? "",
    });
    setEditModal(true);
  };

  const handleCreateSubmit = async (values: TeacherFormData) => {
    setLoading(true);
    try {
      const cleanValues = {
        ...values,
        status:
          values.status && values.status !== "" ? values.status : undefined,
        diploma:
          values.diploma && values.diploma !== "" ? values.diploma : undefined,
        rate:
          values.rate && values.rate !== "" ? Number(values.rate) : undefined,
        email_perso:
          values.email_perso && values.email_perso !== ""
            ? values.email_perso
            : undefined,
        email_ynov:
          values.email_ynov && values.email_ynov !== ""
            ? values.email_ynov
            : undefined,
        phone_number:
          values.phone_number && values.phone_number !== ""
            ? values.phone_number
            : undefined,
      };
      await createTeacherMutation.mutateAsync(cleanValues);
    } catch (error) {
      console.error("Failed to create teacher:", error);
      setLoading(false);
    }
  };

  const handleEditSubmit = async (values: TeacherFormData) => {
    if (!selectedTeacher) return;
    setLoading(true);
    try {
      const cleanValues = {
        id: selectedTeacher.id,
        ...values,
        status:
          values.status && values.status !== "" ? values.status : undefined,
        diploma:
          values.diploma && values.diploma !== "" ? values.diploma : undefined,
        rate:
          values.rate && values.rate !== "" ? Number(values.rate) : undefined,
        email_perso:
          values.email_perso && values.email_perso !== ""
            ? values.email_perso
            : undefined,
        email_ynov:
          values.email_ynov && values.email_ynov !== ""
            ? values.email_ynov
            : undefined,
        phone_number:
          values.phone_number && values.phone_number !== ""
            ? values.phone_number
            : undefined,
      };
      await updateTeacherMutation.mutateAsync(cleanValues);
    } catch (error) {
      console.error("Failed to update teacher:", error);
      setLoading(false);
    }
  };

  const getRelationsCount = (teacher: Teacher) => {
    const ongoing = teacher.ongoing?.length ?? 0;
    const potential = teacher.potential?.length ?? 0;
    const selected = teacher.selected?.length ?? 0;
    return ongoing + potential + selected;
  };

  if (teachersQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Chargement des enseignants...</div>
      </div>
    );
  }

  if (teachersQuery.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">
          Erreur lors du chargement des enseignants
        </div>
      </div>
    );
  }

  const rawTeachers = teachersQuery.data ?? [];

  // Convert API teachers to local Teacher format
  const teachers: Teacher[] = rawTeachers.map((apiTeacher) => ({
    ...apiTeacher,
    rate: apiTeacher.rate ? Number(apiTeacher.rate) : null,
  }));

  // Distinct diploma values available for filtering
  const diplomaOptions = Array.from(
    new Set(teachers.map((t) => t.diploma).filter((d): d is string => !!d)),
  ).sort((a, b) => a.localeCompare(b));

  const hasActiveFilters =
    !!statusFilter ||
    !!rateMin ||
    !!rateMax ||
    relationsFilter !== "all" ||
    !!diplomaFilter;

  const resetFilters = () => {
    setStatusFilter("");
    setRateMin("");
    setRateMax("");
    setRelationsFilter("all");
    setDiplomaFilter("");
  };

  // Filter teachers based on search term (nom, prénom) and active filters
  const filteredTeachers = teachers.filter((teacher) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${teacher.lastname} ${teacher.firstname}`.toLowerCase();
      if (!fullName.includes(searchLower)) return false;
    }

    if (statusFilter && teacher.status !== statusFilter) return false;

    if (rateMin && (!teacher.rate || teacher.rate < Number(rateMin)))
      return false;
    if (rateMax && (!teacher.rate || teacher.rate > Number(rateMax)))
      return false;

    if (relationsFilter !== "all") {
      const relationsCount = getRelationsCount(teacher);
      if (relationsFilter === "with" && relationsCount === 0) return false;
      if (relationsFilter === "without" && relationsCount > 0) return false;
    }

    if (diplomaFilter && teacher.diploma !== diplomaFilter) return false;

    return true;
  });

  // Sort teachers alphabetically by lastname then firstname
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    const lastNameComparison = a.lastname.localeCompare(b.lastname);
    if (lastNameComparison !== 0) return lastNameComparison;
    return a.firstname.localeCompare(b.firstname);
  });

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="glass-card">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <IconUsers size={24} />
                Gestion des Enseignants
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={handleCreateClick} className="btn-primary">
                  <IconPlus size={18} />
                  Ajouter un Enseignant
                </button>
                <button
                  onClick={() => router.push("/teachers/delete")}
                  className="btn-danger"
                >
                  <IconTrash size={18} />
                  Supprimer des Enseignants
                </button>
                <button onClick={() => router.push("/")} className="btn-glass">
                  Retour à l&apos;accueil
                </button>
              </div>
            </div>

            {/* Search Bar + Filters */}
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un enseignant (nom, prénom)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-glass py-2 pr-3 pl-10 placeholder-gray-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      <svg
                        className="h-4 w-4 text-gray-400 hover:text-gray-600"
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
                  )}
                </div>
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className={`btn-glass flex-shrink-0 ${showFilters || hasActiveFilters ? "!bg-brand-50 !text-brand-700" : ""}`}
                >
                  <IconFilter size={16} />
                  Filtres
                  {hasActiveFilters && (
                    <span className="bg-brand-600 ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                      •
                    </span>
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="mt-3 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Statut
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="input-glass"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="Salaried">Salarié</option>
                      <option value="Contractor">Prestataire</option>
                      <option value="To be recruited">À recruter</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Tarif (€/h)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={rateMin}
                        onChange={(e) => setRateMin(e.target.value)}
                        className="input-glass"
                      />
                      <span className="text-gray-400">–</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={rateMax}
                        onChange={(e) => setRateMax(e.target.value)}
                        className="input-glass"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Relations
                    </label>
                    <select
                      value={relationsFilter}
                      onChange={(e) =>
                        setRelationsFilter(
                          e.target.value as "all" | "with" | "without",
                        )
                      }
                      className="input-glass"
                    >
                      <option value="all">Toutes</option>
                      <option value="with">Avec au moins une relation</option>
                      <option value="without">Sans relation</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                      Diplôme
                    </label>
                    <select
                      value={diplomaFilter}
                      onChange={(e) => setDiplomaFilter(e.target.value)}
                      className="input-glass"
                    >
                      <option value="">Tous les diplômes</option>
                      {diplomaOptions.map((diploma) => (
                        <option key={diploma} value={diploma}>
                          {diploma}
                        </option>
                      ))}
                    </select>
                  </div>

                  {hasActiveFilters && (
                    <div className="sm:col-span-2 lg:col-span-4">
                      <button
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        <IconX size={14} />
                        Réinitialiser les filtres
                      </button>
                    </div>
                  )}
                </div>
              )}

              {(searchTerm || hasActiveFilters) && (
                <p className="mt-2 text-sm text-gray-600">
                  {filteredTeachers.length} enseignant(s) trouvé(s)
                  {searchTerm ? ` pour “${searchTerm}”` : ""}
                </p>
              )}
            </div>

            {sortedTeachers.length === 0 ? (
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
                  {searchTerm
                    ? "Aucun enseignant trouvé"
                    : "Aucun enseignant trouvé"}
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  {searchTerm
                    ? "Aucun enseignant ne correspond à votre recherche"
                    : "Commencez par ajouter votre premier enseignant"}
                </p>
                {!searchTerm && (
                  <button onClick={handleCreateClick} className="btn-primary">
                    <IconPlus size={18} />
                    Ajouter le premier enseignant
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Enseignant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Tarif
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Relations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedTeachers.map((teacher) => (
                      <tr
                        key={teacher.id}
                        className="transition-colors hover:bg-white/60"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.lastname} {teacher.firstname}
                            </div>
                            {teacher.diploma && (
                              <div className="text-sm text-gray-500">
                                {teacher.diploma}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {teacher.rate ? (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                              {teacher.rate}€/h
                            </span>
                          ) : (
                            <span className="text-gray-400">Non spécifié</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          <div className="space-y-1">
                            {teacher.email_perso && (
                              <div className="text-sm">
                                {teacher.email_perso}
                              </div>
                            )}
                            {teacher.email_ynov && (
                              <div className="text-sm text-gray-400">
                                {teacher.email_ynov}
                              </div>
                            )}
                            {teacher.phone_number && (
                              <div className="flex items-center gap-1 text-sm text-gray-400">
                                <IconPhone size={14} />
                                {teacher.phone_number}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                            {getRelationsCount(teacher)} relation(s)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/teachers/details?id=${teacher.id}`,
                                )
                              }
                              className="text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
                              disabled={loading}
                            >
                              <IconEye size={16} />
                              Voir
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleEditClick(teacher)}
                              className="flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-900"
                              disabled={loading}
                            >
                              <IconPencil size={16} />
                              Modifier
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => router.push(`/teachers/delete`)}
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

      {/* Create Teacher Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-black/30 backdrop-blur-sm">
          <div className="glass-card relative top-20 mx-auto w-[720px] p-5">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                  <IconPlus size={18} />
                  Ajouter un nouvel enseignant
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="status"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Statut
                    </label>
                    <select
                      id="status"
                      {...createForm.getInputProps("status")}
                      className="input-glass"
                      disabled={loading}
                    >
                      <option value="">Sélectionner un statut</option>
                      <option value="Salaried">Salarié</option>
                      <option value="Contractor">Prestataire</option>
                      <option value="To be recruited">À recruter</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="rate"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Tarif (€/h)
                    </label>
                    <input
                      type="number"
                      id="rate"
                      {...createForm.getInputProps("rate")}
                      className="input-glass"
                      placeholder="Ex: 45"
                      disabled={loading}
                      min="0"
                      max="1000"
                    />
                    {createForm.errors.rate && (
                      <p className="mt-1 text-sm text-red-600">
                        {createForm.errors.rate}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="diploma"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Diplôme
                  </label>
                  <input
                    type="text"
                    id="diploma"
                    {...createForm.getInputProps("diploma")}
                    className="input-glass"
                    placeholder="Ex: Master en Informatique"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="email_perso"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Email personnel
                    </label>
                    <input
                      type="email"
                      id="email_perso"
                      {...createForm.getInputProps("email_perso")}
                      className="input-glass"
                      placeholder="email@perso.com"
                      disabled={loading}
                    />
                    {createForm.errors.email_perso && (
                      <p className="mt-1 text-sm text-red-600">
                        {createForm.errors.email_perso}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email_ynov"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Email Ynov
                    </label>
                    <input
                      type="email"
                      id="email_ynov"
                      {...createForm.getInputProps("email_ynov")}
                      className="input-glass"
                      placeholder="prenom.nom@ynov.com"
                      disabled={loading}
                    />
                    {createForm.errors.email_ynov && (
                      <p className="mt-1 text-sm text-red-600">
                        {createForm.errors.email_ynov}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone_number"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    {...createForm.getInputProps("phone_number")}
                    className="input-glass"
                    placeholder="0123456789"
                    disabled={loading}
                  />
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
                      "Ajout..."
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <IconPlus size={16} />
                        Ajouter
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-black/30 backdrop-blur-sm">
          <div className="glass-card relative top-20 mx-auto w-[720px] p-5">
            <div className="mt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                  <IconPencil size={18} />
                  Modifier l&apos;enseignant
                </h3>
                <button
                  onClick={() => {
                    setEditModal(false);
                    setSelectedTeacher(null);
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

              <div className="bg-brand-50 mb-4 rounded-md p-3">
                <p className="text-brand-800 text-sm">
                  <strong>Enseignant:</strong> {selectedTeacher.lastname}{" "}
                  {selectedTeacher.firstname}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-status"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Statut
                    </label>
                    <select
                      id="edit-status"
                      {...editForm.getInputProps("status")}
                      className="input-glass"
                      disabled={loading}
                    >
                      <option value="">Sélectionner un statut</option>
                      <option value="Salaried">Salarié</option>
                      <option value="Contractor">Prestataire</option>
                      <option value="To be recruited">À recruter</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-rate"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Tarif (€/h)
                    </label>
                    <input
                      type="number"
                      id="edit-rate"
                      {...editForm.getInputProps("rate")}
                      className="input-glass"
                      placeholder="Ex: 45"
                      disabled={loading}
                      min="0"
                      max="1000"
                    />
                    {editForm.errors.rate && (
                      <p className="mt-1 text-sm text-red-600">
                        {editForm.errors.rate}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="edit-diploma"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Diplôme
                  </label>
                  <input
                    type="text"
                    id="edit-diploma"
                    {...editForm.getInputProps("diploma")}
                    className="input-glass"
                    placeholder="Ex: Master en Informatique"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-email_perso"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Email personnel
                    </label>
                    <input
                      type="email"
                      id="edit-email_perso"
                      {...editForm.getInputProps("email_perso")}
                      className="input-glass"
                      placeholder="email@perso.com"
                      disabled={loading}
                    />
                    {editForm.errors.email_perso && (
                      <p className="mt-1 text-sm text-red-600">
                        {editForm.errors.email_perso}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="edit-email_ynov"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Email Ynov
                    </label>
                    <input
                      type="email"
                      id="edit-email_ynov"
                      {...editForm.getInputProps("email_ynov")}
                      className="input-glass"
                      placeholder="email@ynov-campus.com"
                      disabled={loading}
                    />
                    {editForm.errors.email_ynov && (
                      <p className="mt-1 text-sm text-red-600">
                        {editForm.errors.email_ynov}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="edit-phone_number"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    id="edit-phone_number"
                    {...editForm.getInputProps("phone_number")}
                    className="input-glass"
                    placeholder="0123456789"
                    disabled={loading}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditModal(false);
                      setSelectedTeacher(null);
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
