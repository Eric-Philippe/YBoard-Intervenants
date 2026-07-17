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
  CreateUserModal,
  PromoSelectionModal,
  PotentialTeachersModal,
} from "./components/main";
import { AddTeacherModal } from "./modules/details/components";
import {
  groupByPromo,
  loadSelectedPromos,
  saveSelectedPromos,
} from "./components/main/utils";
import type { CartesianData, CurrentRelation } from "./components/main/types";

export default function MainPage() {
  const [cartesianData, setCartesianData] = useState<CartesianData[]>([]);
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
  const mineQuery = api.perimeters.getMine.useQuery();
  const activePerimeterId = mineQuery.data?.activePerimeterId ?? undefined;
  const cartesianQuery = api.promoModules.getCartesianData.useQuery();
  const teachersQuery = api.teachers.getAll.useQuery();
  const promosQuery = api.promos.getAll.useQuery();

  const createUserMutation = api.users.create.useMutation({
    onSuccess: () => {
      void utils.users.invalidate();
      setCreateUserModal(false);
      userForm.reset();
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

  // When the active perimeter changes, reset initialization so the selection
  // is reloaded from the perimeter-specific localStorage key (or defaults to all).
  useEffect(() => {
    setIsInitialized(false);
    setSelectedPromos(new Set());
    setExpandedPromos(new Set());
  }, [activePerimeterId]);

  useEffect(() => {
    if (cartesianQuery.data) {
      setCartesianData(cartesianQuery.data);
    }

    const hasData =
      (cartesianQuery.data?.length ?? 0) > 0 ||
      (promosQuery.data?.length ?? 0) > 0;

    if (!isInitialized && hasData && !cartesianQuery.isLoading && !promosQuery.isLoading) {
      const baseGrouped = groupByPromo(cartesianQuery.data ?? []);
      const merged = { ...baseGrouped };
      if (promosQuery.data) {
        for (const promo of promosQuery.data) {
          const key = `${promo.level} ${promo.specialty}`;
          if (!(key in merged)) merged[key] = [];
        }
      }
      const allPromoNames = Object.keys(merged);

      // Charger les promos sélectionnées depuis localStorage (clé par périmètre)
      const storedSelectedPromos = loadSelectedPromos(activePerimeterId);

      // Si aucune promo stockée pour ce périmètre, sélectionner toutes par défaut
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

    setLoading(
      cartesianQuery.isLoading ||
        teachersQuery.isLoading ||
        promosQuery.isLoading,
    );
  }, [
    cartesianQuery.data,
    cartesianQuery.isLoading,
    teachersQuery.data,
    teachersQuery.isLoading,
    promosQuery.data,
    promosQuery.isLoading,
    isInitialized,
    activePerimeterId,
  ]);

  if (authLoading || !isAuthenticated) {
    return <LoadingOverlay visible />;
  }

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
    item: CartesianData,
  ) => {
    setCurrentRelation({
      type,
      promoModuleId: item.promoModule.id,
      moduleWorkload: item.promoModule.workload,
      moduleNombreHeureTDP: item.promoModule.module.nombreHeureTDP,
      moduleNombreHeureFFP: item.promoModule.module.nombreHeureFFP,
      excludeTeacherIds: item[type].map((r) => r.teacher.id),
    });
    setEditRelationModal(true);
  };

  const openPotentialTeachersModal = (
    teachers: Array<{
      teacher: { id: string; lastname: string; firstname: string };
    }>,
  ) => {
    setSelectedPotentialTeachers(teachers);
    setPotentialTeachersModal(true);
  };

  const groupedData = (() => {
    const base = groupByPromo(cartesianData);
    const merged = { ...base };
    if (promosQuery.data) {
      for (const promo of promosQuery.data) {
        const key = `${promo.level} ${promo.specialty}`;
        if (!(key in merged)) merged[key] = [];
      }
    }
    return merged;
  })();

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
    saveSelectedPromos(newSelected, activePerimeterId);
  };

  const selectAllPromos = () => {
    const allPromoNames = Object.keys(groupedData);
    const newSelected = new Set(allPromoNames);
    setSelectedPromos(newSelected);
    saveSelectedPromos(newSelected, activePerimeterId);
  };

  const deselectAllPromos = () => {
    setSelectedPromos(new Set());
    setExpandedPromos(new Set());
    saveSelectedPromos(new Set(), activePerimeterId);
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
      {currentRelation && (
        <AddTeacherModal
          opened={editRelationModal}
          onClose={() => {
            setEditRelationModal(false);
            setCurrentRelation(null);
          }}
          status={currentRelation.type}
          promoModulesId={currentRelation.promoModuleId}
          moduleBaseWorkload={currentRelation.moduleWorkload}
          moduleNombreHeureTDP={currentRelation.moduleNombreHeureTDP}
          moduleNombreHeureFFP={currentRelation.moduleNombreHeureFFP}
          excludeTeacherIds={currentRelation.excludeTeacherIds}
        />
      )}

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
