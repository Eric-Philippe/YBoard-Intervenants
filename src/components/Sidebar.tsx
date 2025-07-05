"use client";

import React, { useState } from "react";
import {
  Text,
  ScrollArea,
  UnstyledButton,
  Badge,
  Avatar,
  Collapse,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useAuth } from "~/contexts/AuthContext";
import { useModal } from "~/contexts/ModalContext";
import { api } from "~/trpc/react";
import {
  IconSchool,
  IconBook,
  IconUsers,
  IconLogout,
  IconHome,
  IconTrash,
  IconEye,
  IconSettings,
  IconChevronDown,
  IconUser,
  IconBuildingSkyscraper,
  IconUserCog,
  IconPlus,
} from "@tabler/icons-react";

type SidebarProps = Record<string, never>;

const Sidebar: React.FC<SidebarProps> = () => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { setCreatePromoModal, setCreateModuleModal } = useModal();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Récupération des comptes via tRPC
  const { data: promosCount = 0 } = api.promos.getCount.useQuery();
  const { data: modulesCount = 0 } = api.modules.getCount.useQuery();
  const { data: teachersCount = 0 } = api.teachers.getCount.useQuery();
  const { data: usersCount = 0 } = api.users.getCount.useQuery();

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = (menu: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menu)) {
      newExpanded.delete(menu);
    } else {
      newExpanded.add(menu);
    }
    setExpandedMenus(newExpanded);
  };

  const MenuItem = ({
    icon,
    label,
    onClick,
    isActive = false,
    count,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isActive?: boolean;
    count?: number;
  }) => (
    <UnstyledButton
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium transition-all duration-200 ${
        isActive
          ? "bg-blue-50 text-blue-700 shadow-sm"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <div
        className={`${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}`}
      >
        {icon}
      </div>
      <div className="flex flex-1 items-center justify-between">
        <span className="text-sm">{label}</span>
        {count && (
          <Badge size="sm" variant="light" color={isActive ? "blue" : "gray"}>
            {count}
          </Badge>
        )}
      </div>
    </UnstyledButton>
  );

  const MenuSection = ({
    icon,
    label,
    children,
    menuKey,
    count,
  }: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
    menuKey: string;
    count?: number;
  }) => {
    const isExpanded = expandedMenus.has(menuKey);

    return (
      <div className="space-y-1">
        <UnstyledButton
          onClick={() => toggleMenu(menuKey)}
          className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-200 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-500 group-hover:text-gray-700">
              {icon}
            </div>
            <div className="flex items-center gap-2">
              <Text
                size="sm"
                fw={600}
                className="text-gray-700 group-hover:text-gray-900"
              >
                {label}
              </Text>
              {count && (
                <Badge size="xs" variant="light" color="gray">
                  {count}
                </Badge>
              )}
            </div>
          </div>
          <IconChevronDown
            size={14}
            className={`text-gray-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </UnstyledButton>

        <Collapse in={isExpanded}>
          <div className="ml-6 space-y-1 border-l border-gray-100 pl-3">
            {children}
          </div>
        </Collapse>
      </div>
    );
  };

  const SubMenuItem = ({
    icon,
    label,
    onClick,
    color = "gray",
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color?: "gray" | "blue" | "green" | "red";
  }) => {
    const colorClasses = {
      gray: "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
      blue: "text-blue-500 hover:text-blue-700 hover:bg-blue-50",
      green: "text-green-500 hover:text-green-700 hover:bg-green-50",
      red: "text-red-500 hover:text-red-700 hover:bg-red-50",
    };

    return (
      <UnstyledButton
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${colorClasses[color]}`}
      >
        {icon}
        <span>{label}</span>
      </UnstyledButton>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <IconBuildingSkyscraper size={18} className="text-white" />
            </div>
            <div>
              <Text size="lg" fw={700} className="text-gray-900">
                YBoard - Intervenants
              </Text>
              <Text size="xs" className="text-gray-500">
                Ynov Management
              </Text>
            </div>
          </div>
        </div>

        {/* Profil utilisateur */}
        {user && (
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <Avatar
                size="md"
                radius="xl"
                className="bg-blue-100 text-blue-700"
              >
                <IconUser size={20} />
              </Avatar>
              <div className="min-w-0 flex-1">
                <Text size="sm" fw={600} className="truncate text-gray-900">
                  {user.firstname} {user.lastname}
                </Text>
                <Text size="xs" className="truncate text-gray-500">
                  {user.email}
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-2">
            {/* Accueil */}
            <MenuItem
              icon={<IconHome size={20} />}
              label="Tableau de bord"
              onClick={() => {
                router.push("/");
                setExpandedMenus(new Set()); // Reset expanded menus
              }}
            />

            <div className="my-4">
              <div className="mx-3 h-px bg-gray-100" />
            </div>

            {/* Sections principales */}
            <MenuSection
              icon={<IconSchool size={20} />}
              label="Promotions"
              menuKey="promos"
              count={promosCount}
            >
              <SubMenuItem
                icon={<IconPlus size={16} />}
                label="Créer une Promo"
                onClick={() => setCreatePromoModal(true)}
                color="green"
              />
              <SubMenuItem
                icon={<IconSettings size={16} />}
                label="Gérer les Promos"
                onClick={() => router.push("/promos")}
              />
              <SubMenuItem
                icon={<IconTrash size={16} />}
                label="Supprimer des Promos"
                onClick={() => router.push("/promos/delete")}
                color="red"
              />
            </MenuSection>

            <MenuSection
              icon={<IconBook size={20} />}
              label="Modules"
              menuKey="modules"
              count={modulesCount}
            >
              <SubMenuItem
                icon={<IconPlus size={16} />}
                label="Créer un Module"
                onClick={() => setCreateModuleModal(true)}
                color="green"
              />
              <SubMenuItem
                icon={<IconSettings size={16} />}
                label="Gérer les Modules"
                onClick={() => router.push("/modules")}
              />
              <SubMenuItem
                icon={<IconEye size={16} />}
                label="Détails des Modules"
                onClick={() => router.push("/modules/details")}
                color="blue"
              />
              <SubMenuItem
                icon={<IconTrash size={16} />}
                label="Supprimer des Modules"
                onClick={() => router.push("/modules/delete")}
                color="red"
              />
            </MenuSection>

            <MenuSection
              icon={<IconUsers size={20} />}
              label="Enseignants"
              menuKey="teachers"
              count={teachersCount}
            >
              <SubMenuItem
                icon={<IconSettings size={16} />}
                label="Gérer les Enseignants"
                onClick={() => router.push("/teachers")}
              />
              <SubMenuItem
                icon={<IconTrash size={16} />}
                label="Supprimer des Enseignants"
                onClick={() => router.push("/teachers/delete")}
                color="red"
              />
            </MenuSection>

            <div className="my-4">
              <div className="mx-3 h-px bg-gray-100" />
            </div>

            <MenuSection
              icon={<IconUser size={20} />}
              label="Utilisateurs"
              menuKey="users"
              count={usersCount}
            >
              <SubMenuItem
                icon={<IconSettings size={16} />}
                label="Gérer les Utilisateurs"
                onClick={() => router.push("/users")}
              />
              <SubMenuItem
                icon={<IconTrash size={16} />}
                label="Supprimer des Utilisateurs"
                onClick={() => router.push("/users/delete")}
                color="red"
              />
            </MenuSection>

            <div className="my-4">
              <div className="mx-3 h-px bg-gray-100" />
            </div>

            {/* Section Profil */}
            <MenuSection
              icon={<IconUserCog size={20} />}
              label="Mon Profil"
              menuKey="profile"
            >
              <SubMenuItem
                icon={<IconSettings size={16} />}
                label="Informations Personnelles"
                onClick={() => router.push("/profile")}
                color="blue"
              />
            </MenuSection>
          </div>
        </ScrollArea>

        {/* Footer avec déconnexion */}
        <div className="border-t border-gray-100 p-3">
          <UnstyledButton
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium text-red-600 transition-all duration-200 hover:bg-red-50"
          >
            <IconLogout size={20} />
            <span className="text-sm">Déconnexion</span>
          </UnstyledButton>{" "}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
