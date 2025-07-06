"use client";

import React, { useState, useEffect } from "react";
import { Container, LoadingOverlay, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { api } from "~/trpc/react";
import { useAuth } from "~/contexts/AuthContext";
import { useModal } from "~/contexts/ModalContext";
import { useRouter } from "next/navigation";

import {
  MainPageHeader,
  HelpTip,
  EmptyState,
  PromoSection,
  EditRelationModal,
  CreateUserModal,
  PromoSelectionModal,
  PotentialTeachersModal,
} from "./components/main";
import {
  groupByPromo,
  loadSelectedPromos,
  saveSelectedPromos,
  getNumericRate,
} from "./components/main/utils";
import type {
  CartesianData,
  Teacher,
  CurrentRelation,
} from "./components/main/types";

export default function MainPage() {
  const [cartesianData, setCartesianData] = useState<CartesianData[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [expandedPromos, setExpandedPromos] = useState<Set<string>>(new Set());
  const [selectedPromos, setSelectedPromos] = useState<Set<string>>(new Set());
  const [promoSelectorOpen, setPromoSelectorOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [potentialTeachersModal, setPotentialTeachersModal] = useState(false);
  const [selectedPotentialTeachers, setSelectedPotentialTeachers] = useState<
    Array<{ teacher: { id: string; lastname: string; firstname: string } }>
  >([]);

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

  const openPotentialTeachersModal = (
    teachers: Array<{
      teacher: { id: string; lastname: string; firstname: string };
    }>,
  ) => {
    setSelectedPotentialTeachers(teachers);
    setPotentialTeachersModal(true);
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

  const filteredPromos = Object.entries(groupedData).filter(([promoName]) =>
    isPromoSelected(promoName),
  );

  return (
    <Container size="xl" className="py-8">
      <LoadingOverlay visible={loading} />

      <MainPageHeader onOpenPromoSelector={() => setPromoSelectorOpen(true)} />

      {error && (
        <Alert color="red" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="space-y-8">
        <HelpTip groupedDataLength={Object.keys(groupedData).length} />

        {filteredPromos.length === 0 && (
          <EmptyState onOpenPromoSelector={() => setPromoSelectorOpen(true)} />
        )}

        {filteredPromos.map(([promoName, items]) => (
          <PromoSection
            key={promoName}
            promoName={promoName}
            items={items}
            isExpanded={isPromoExpanded(promoName)}
            onToggleExpansion={togglePromoExpansion}
            onOpenRelationModal={openRelationModal}
            onOpenPotentialTeachersModal={openPotentialTeachersModal}
          />
        ))}
      </div>

      {/* Modals */}
      <EditRelationModal
        opened={editRelationModal}
        onClose={() => setEditRelationModal(false)}
        currentRelation={currentRelation}
        teachers={teachers}
        relationForm={relationForm}
        onSubmit={handleEditRelation}
        onAddTeacher={addTeacherToRelation}
        onRemoveTeacher={removeTeacherFromRelation}
        onUpdateWorkload={updateTeacherWorkload}
        onUpdateRate={updateTeacherRate}
      />

      <CreateUserModal
        opened={createUserModal}
        onClose={() => setCreateUserModal(false)}
        userForm={userForm}
        onSubmit={handleCreateUser}
      />

      <PromoSelectionModal
        opened={promoSelectorOpen}
        onClose={() => setPromoSelectorOpen(false)}
        groupedData={groupedData}
        selectedPromos={selectedPromos}
        onTogglePromoSelection={togglePromoSelection}
        onSelectAllPromos={selectAllPromos}
        onDeselectAllPromos={deselectAllPromos}
      />

      <PotentialTeachersModal
        opened={potentialTeachersModal}
        onClose={() => setPotentialTeachersModal(false)}
        selectedPotentialTeachers={selectedPotentialTeachers}
      />
    </Container>
  );
}
