"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Button,
  Table,
  Badge,
  Select,
  LoadingOverlay,
  Group,
  Text,
  Paper,
  Modal,
  TextInput,
  NumberInput,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { api } from "~/trpc/react";
import { useAuth } from "~/contexts/AuthContext";
import { useModal } from "~/contexts/ModalContext";
import { useRouter } from "next/navigation";
import type { Decimal } from "@prisma/client/runtime/library";

interface CartesianData {
  promoModule: {
    id: string;
    moduleId: string;
    promoId: string;
    workload: number;
    module: { id: string; name: string };
    promo: { id: string; level: string; specialty: string };
  };
  ongoing: Array<{
    teacher: { id: string; lastname: string; firstname: string };
  }>;
  potential: Array<{
    teacher: { id: string; lastname: string; firstname: string };
  }>;
  selected: Array<{
    teacher: { id: string; lastname: string; firstname: string };
  }>;
}

interface Teacher {
  id: string;
  lastname: string;
  firstname: string;
  rate?: Decimal | null;
}

interface CurrentRelation {
  type: "ongoing" | "potential" | "selected";
  promoModuleId: string;
  moduleWorkload: number;
}

export default function MainPage() {
  const [cartesianData, setCartesianData] = useState<CartesianData[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [expandedPromos, setExpandedPromos] = useState<Set<string>>(new Set());
  const [selectedPromos, setSelectedPromos] = useState<Set<string>>(new Set());
  const [promoSelectorOpen, setPromoSelectorOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Clé pour le localStorage
  const STORAGE_KEY = "yboard-selected-promos";

  // Fonctions utilitaires pour le localStorage
  const loadSelectedPromos = (): Set<string> => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as string[];
          return new Set(parsed);
        } catch {
          return new Set();
        }
      }
    }
    return new Set();
  };

  const saveSelectedPromos = (promos: Set<string>) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(promos)));
    }
  };

  // Utility function to convert Decimal to number
  const getNumericRate = (rate: Decimal | null | undefined): number => {
    if (!rate) return 0;
    return typeof rate === "number" ? rate : Number(rate.toString());
  };

  // Modals
  const { createUserModal, setCreateUserModal } = useModal();
  const [editRelationModal, setEditRelationModal] = useState(false);
  const [currentRelation, setCurrentRelation] =
    useState<CurrentRelation | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // tRPC hooks
  const utils = api.useUtils();
  const cartesianQuery = api.promoModules.getCartesianData.useQuery();
  const teachersQuery = api.teachers.getAll.useQuery();
  const promosQuery = api.promos.getAll.useQuery();

  const createOngoingMutation = api.relations.createOngoing.useMutation({
    onSuccess: () => {
      void utils.promoModules.invalidate();
    },
  });

  const createPotentialMutation = api.relations.createPotential.useMutation({
    onSuccess: () => {
      void utils.promoModules.invalidate();
    },
  });

  const createSelectedMutation = api.relations.createSelected.useMutation({
    onSuccess: () => {
      void utils.promoModules.invalidate();
    },
  });

  const createUserMutation = api.users.create.useMutation({
    onSuccess: () => {
      void utils.users.invalidate();
      setCreateUserModal(false);
      userForm.reset();
    },
  });

  const relationForm = useForm({
    initialValues: {
      teacherWorkloads: [] as {
        teacherId: string;
        workload: number;
        rate?: number;
      }[],
    },
  });

  const userForm = useForm({
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (cartesianQuery.data) {
      setCartesianData(cartesianQuery.data);

      if (!isInitialized && cartesianQuery.data.length > 0) {
        const groupedData = groupByPromo(cartesianQuery.data);
        const allPromoNames = Object.keys(groupedData);

        // Charger les promos sélectionnées depuis localStorage
        const storedSelectedPromos = loadSelectedPromos();

        // Si aucune promo stockée, sélectionner toutes par défaut
        const initialSelectedPromos =
          storedSelectedPromos.size > 0
            ? storedSelectedPromos
            : new Set(allPromoNames);

        setSelectedPromos(initialSelectedPromos);

        // Ouvrir la première promo sélectionnée par défaut
        const firstSelectedPromo = Array.from(initialSelectedPromos)[0];
        if (firstSelectedPromo) {
          setExpandedPromos(new Set([firstSelectedPromo]));
        }

        setIsInitialized(true);
      }
    }
    if (teachersQuery.data) setTeachers(teachersQuery.data);

    setLoading(
      cartesianQuery.isLoading ||
        teachersQuery.isLoading ||
        promosQuery.isLoading,
    );
  }, [
    cartesianQuery.data,
    teachersQuery.data,
    promosQuery.data,
    cartesianQuery.isLoading,
    teachersQuery.isLoading,
    promosQuery.isLoading,
    isInitialized,
  ]);

  if (authLoading || !isAuthenticated) {
    return <LoadingOverlay visible />;
  }

  const handleEditRelation = async (values: {
    teacherWorkloads: { teacherId: string; workload: number; rate?: number }[];
  }) => {
    if (!currentRelation) return;

    try {
      const { type, promoModuleId } = currentRelation;

      for (const { teacherId, workload, rate } of values.teacherWorkloads) {
        const relationData = {
          teacherId,
          promoModulesId: promoModuleId,
          workload,
          rate,
        };

        switch (type) {
          case "ongoing":
            await createOngoingMutation.mutateAsync(relationData);
            break;
          case "potential":
            await createPotentialMutation.mutateAsync(relationData);
            break;
          case "selected":
            await createSelectedMutation.mutateAsync(relationData);
            break;
        }
      }

      setEditRelationModal(false);
      setCurrentRelation(null);
      relationForm.reset();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update relation");
      }
    }
  };

  const handleCreateUser = async (values: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
  }) => {
    try {
      await createUserMutation.mutateAsync(values);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create user");
      }
    }
  };

  const openRelationModal = (
    type: "ongoing" | "potential" | "selected",
    promoModuleId: string,
    moduleWorkload: number,
  ) => {
    setCurrentRelation({ type, promoModuleId, moduleWorkload });
    setEditRelationModal(true);
  };

  const addTeacherToRelation = (teacherId: string) => {
    const currentWorkloads = relationForm.values.teacherWorkloads;
    const teacherExists = currentWorkloads.find(
      (tw) => tw.teacherId === teacherId,
    );

    if (!teacherExists) {
      const defaultWorkload = currentRelation?.moduleWorkload ?? 1;
      const teacher = teachers.find((t) => t.id === teacherId);
      const defaultRate = getNumericRate(teacher?.rate);

      relationForm.setFieldValue("teacherWorkloads", [
        ...currentWorkloads,
        { teacherId, workload: defaultWorkload, rate: defaultRate },
      ]);
    }
  };

  const removeTeacherFromRelation = (teacherId: string) => {
    const currentWorkloads = relationForm.values.teacherWorkloads;
    relationForm.setFieldValue(
      "teacherWorkloads",
      currentWorkloads.filter((tw) => tw.teacherId !== teacherId),
    );
  };

  const updateTeacherWorkload = (teacherId: string, workload: number) => {
    const currentWorkloads = relationForm.values.teacherWorkloads;
    relationForm.setFieldValue(
      "teacherWorkloads",
      currentWorkloads.map((tw) =>
        tw.teacherId === teacherId ? { ...tw, workload } : tw,
      ),
    );
  };

  const updateTeacherRate = (teacherId: string, rate: number) => {
    const currentWorkloads = relationForm.values.teacherWorkloads;
    relationForm.setFieldValue(
      "teacherWorkloads",
      currentWorkloads.map((tw) =>
        tw.teacherId === teacherId ? { ...tw, rate } : tw,
      ),
    );
  };

  const getTeacherNames = (
    relations: { teacher: { lastname: string; firstname: string } }[],
  ) => {
    return relations
      .map((rel) => `${rel.teacher.lastname} ${rel.teacher.firstname}`)
      .join(", ");
  };

  const groupByPromo = (data: CartesianData[]) => {
    const grouped: Record<string, CartesianData[]> = {};
    data.forEach((item) => {
      const promoKey = `${item.promoModule.promo.level} ${item.promoModule.promo.specialty}`;
      grouped[promoKey] ??= [];
      grouped[promoKey].push(item);
    });
    return grouped;
  };

  const groupedData = groupByPromo(cartesianData);

  const togglePromoExpansion = (promoName: string) => {
    const newExpanded = new Set(expandedPromos);
    if (newExpanded.has(promoName)) {
      newExpanded.delete(promoName);
    } else {
      newExpanded.add(promoName);
    }
    setExpandedPromos(newExpanded);
  };

  const isPromoExpanded = (promoName: string) => {
    return expandedPromos.has(promoName);
  };

  const isPromoSelected = (promoName: string) => {
    return selectedPromos.has(promoName);
  };

  const togglePromoSelection = (promoName: string, isSelected: boolean) => {
    const newSelected = new Set(selectedPromos);
    if (isSelected) {
      newSelected.add(promoName);
    } else {
      newSelected.delete(promoName);
      // Si la promo était dépliée, la replier aussi
      const newExpanded = new Set(expandedPromos);
      newExpanded.delete(promoName);
      setExpandedPromos(newExpanded);
    }
    setSelectedPromos(newSelected);
    saveSelectedPromos(newSelected);
  };

  const selectAllPromos = () => {
    const allPromoNames = Object.keys(groupedData);
    const newSelected = new Set(allPromoNames);
    setSelectedPromos(newSelected);
    saveSelectedPromos(newSelected);
  };

  const deselectAllPromos = () => {
    setSelectedPromos(new Set());
    setExpandedPromos(new Set());
    saveSelectedPromos(new Set());
  };

  return (
    <Container size="xl" className="py-8">
      <LoadingOverlay visible={loading} />

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
          onClick={() => setPromoSelectorOpen(true)}
        >
          Sélectionner les promos
        </Button>
      </div>

      {error && (
        <Alert color="red" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="space-y-8">
        {Object.keys(groupedData).length > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">💡 Astuce</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Cliquez sur le nom d&apos;un module (🔍) pour accéder
                    directement à ses détails complets !
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {Object.entries(groupedData).filter(([promoName]) =>
          isPromoSelected(promoName),
        ).length === 0 && (
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
                Cliquez sur le bouton &quot;Sélectionner les promos&quot; pour
                choisir quelles promos afficher.
              </p>
              <Button
                onClick={() => setPromoSelectorOpen(true)}
                variant="light"
                color="yellow"
              >
                Sélectionner des promos
              </Button>
            </div>
          </div>
        )}

        {Object.entries(groupedData)
          .filter(([promoName]) => isPromoSelected(promoName))
          .map(([promoName, items]) => (
            <Paper key={promoName} shadow="sm" p="md">
              <div
                className="mb-4 flex cursor-pointer items-center justify-between border-b pb-2"
                onClick={() => togglePromoExpansion(promoName)}
              >
                <Title order={3} className="text-blue-800">
                  {promoName}
                </Title>
                <div className="flex items-center gap-2">
                  <Badge color="gray" size="sm">
                    {items.length} module{items.length > 1 ? "s" : ""}
                  </Badge>
                  <svg
                    className={`h-5 w-5 text-blue-600 transition-transform duration-200 ${
                      isPromoExpanded(promoName) ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {isPromoExpanded(promoName) && (
                <div className="overflow-x-auto">
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Module</Table.Th>
                        <Table.Th>Workload</Table.Th>
                        <Table.Th>Ongoing Teachers</Table.Th>
                        <Table.Th>Potential Teachers</Table.Th>
                        <Table.Th>Selected Teachers</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {items.map((item) => (
                        <Table.Tr key={item.promoModule.id}>
                          <Table.Td>
                            <button
                              onClick={() => {
                                router.push(
                                  `/modules/details?promoId=${item.promoModule.promo.id}&moduleId=${item.promoModule.id}`,
                                );
                              }}
                              className="cursor-pointer border-none bg-transparent p-0 text-left font-medium transition-colors hover:text-blue-600 hover:underline"
                            >
                              🔍 {item.promoModule.module.name}
                            </button>
                          </Table.Td>
                          <Table.Td>
                            <Badge color="blue">
                              {item.promoModule.workload}h
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {item.ongoing.length > 0
                                ? getTeacherNames(item.ongoing)
                                : "None"}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {item.potential.length > 0
                                ? getTeacherNames(item.potential)
                                : "None"}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {item.selected.length > 0
                                ? getTeacherNames(item.selected)
                                : "None"}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <Button
                                size="xs"
                                variant="light"
                                color="green"
                                onClick={() =>
                                  openRelationModal(
                                    "ongoing",
                                    item.promoModule.id,
                                    item.promoModule.workload,
                                  )
                                }
                              >
                                + Ongoing
                              </Button>
                              <Button
                                size="xs"
                                variant="light"
                                color="orange"
                                onClick={() =>
                                  openRelationModal(
                                    "potential",
                                    item.promoModule.id,
                                    item.promoModule.workload,
                                  )
                                }
                              >
                                + Potential
                              </Button>
                              <Button
                                size="xs"
                                variant="light"
                                color="blue"
                                onClick={() =>
                                  openRelationModal(
                                    "selected",
                                    item.promoModule.id,
                                    item.promoModule.workload,
                                  )
                                }
                              >
                                + Selected
                              </Button>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              )}
            </Paper>
          ))}
      </div>

      {/* Edit Relation Modal */}
      <Modal
        opened={editRelationModal}
        onClose={() => setEditRelationModal(false)}
        title={`Add ${currentRelation?.type} Teachers`}
        size="lg"
      >
        <form onSubmit={relationForm.onSubmit(handleEditRelation)}>
          {/* Teacher Selection */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Teachers
            </label>
            <Select
              placeholder="Choose a teacher to add"
              searchable
              data={teachers
                .filter(
                  (teacher) =>
                    !relationForm.values.teacherWorkloads.find(
                      (tw) => tw.teacherId === teacher.id,
                    ),
                )
                .map((teacher) => ({
                  value: teacher.id,
                  label: `${teacher.lastname} ${teacher.firstname}`,
                }))}
              onChange={(value) => {
                if (value) {
                  addTeacherToRelation(value);
                }
              }}
              value={null}
            />
          </div>

          {/* Selected Teachers with Individual Workloads and Rates */}
          {relationForm.values.teacherWorkloads.length > 0 && (
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Teachers, their Workloads and Hourly Rates
              </label>
              <div className="space-y-3">
                {relationForm.values.teacherWorkloads.map(
                  (teacherWorkload, _index) => {
                    const teacher = teachers.find(
                      (t) => t.id === teacherWorkload.teacherId,
                    );
                    const teacherDefaultRate = getNumericRate(teacher?.rate);

                    return (
                      <div
                        key={teacherWorkload.teacherId}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                      >
                        <div className="flex-1">
                          <Text size="sm" fw={500}>
                            {teacher?.lastname} {teacher?.firstname}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Default rate: {teacherDefaultRate}€/h
                          </Text>
                        </div>
                        <div className="w-32">
                          <label className="mb-1 block text-xs text-gray-600">
                            Hours
                          </label>
                          <NumberInput
                            placeholder="Hours"
                            min={1}
                            value={teacherWorkload.workload}
                            onChange={(value) => {
                              if (typeof value === "number") {
                                updateTeacherWorkload(
                                  teacherWorkload.teacherId,
                                  value,
                                );
                              }
                            }}
                            size="sm"
                          />
                        </div>
                        <div className="w-32">
                          <label className="mb-1 block text-xs text-gray-600">
                            Rate (€/h)
                          </label>
                          <NumberInput
                            placeholder="Rate"
                            min={0}
                            step={0.01}
                            value={teacherWorkload.rate ?? teacherDefaultRate}
                            onChange={(value) => {
                              if (typeof value === "number") {
                                updateTeacherRate(
                                  teacherWorkload.teacherId,
                                  value,
                                );
                              }
                            }}
                            size="sm"
                          />
                        </div>
                        <Button
                          size="xs"
                          variant="light"
                          color="red"
                          onClick={() =>
                            removeTeacherFromRelation(teacherWorkload.teacherId)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {relationForm.values.teacherWorkloads.length === 0 && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <Text size="sm" c="dimmed">
                No teachers selected. Please add teachers using the dropdown
                above.
              </Text>
            </div>
          )}

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setEditRelationModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={relationForm.values.teacherWorkloads.length === 0}
            >
              Add Teachers
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Create User Modal */}
      <Modal
        opened={createUserModal}
        onClose={() => setCreateUserModal(false)}
        title="Créer un Nouvel Utilisateur"
      >
        <form onSubmit={userForm.onSubmit(handleCreateUser)}>
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
            <Button variant="light" onClick={() => setCreateUserModal(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Créer
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Promo Selection Modal */}
      <Modal
        opened={promoSelectorOpen}
        onClose={() => setPromoSelectorOpen(false)}
        title="Sélectionner les promos à afficher"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              size="xs"
              variant="light"
              color="green"
              onClick={selectAllPromos}
            >
              Tout sélectionner
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={deselectAllPromos}
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
                      togglePromoSelection(promoName, e.target.checked)
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
            <Button onClick={() => setPromoSelectorOpen(false)}>Fermer</Button>
          </div>
        </div>
      </Modal>
    </Container>
  );
}
