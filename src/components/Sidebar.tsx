"use client";

import React, { useState } from "react";
import {
  Text,
  ScrollArea,
  UnstyledButton,
  Badge,
  Avatar,
  Collapse,
  Menu,
} from "@mantine/core";
import { AboutModal } from "./AboutModal";
import { useRouter, usePathname } from "next/navigation";
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
  IconSettings,
  IconChevronDown,
  IconUser,
  IconBuildingSkyscraper,
  IconUserCog,
  IconPlus,
  IconClipboardList,
  IconExternalLink,
  IconCheck,
  IconLayoutDashboard,
  IconInfoCircle,
} from "@tabler/icons-react";

const ENABLE_SONDAGE = process.env.NEXT_PUBLIC_ENABLE_SONDAGE !== "false";

type SidebarProps = Record<string, never>;

const Sidebar: React.FC<SidebarProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { setCreatePromoModal, setCreateModuleModal } = useModal();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [aboutModal, setAboutModal] = useState(false);
  const utils = api.useUtils();

  const { data: mine } = api.perimeters.getMine.useQuery(undefined, {
    enabled: !!user,
  });
  const setActive = api.perimeters.setActive.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.perimeters.getMine.invalidate(),
        utils.promos.invalidate(),
        utils.modules.invalidate(),
        utils.promoModules.invalidate(),
        utils.surveyAdmin.invalidate(),
        utils.teachers.invalidate(),
      ]);
    },
  });

  const activePerimeter = mine?.perimeters.find(
    (p) => p.id === mine.activePerimeterId,
  );

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
      className={`surface-hover group relative flex w-full items-center gap-2.5 rounded-xl py-2.5 pr-3 pl-2.5 text-left font-medium ${
        isActive
          ? "!bg-brand-50 !text-brand-700"
          : "text-gray-700 hover:!bg-white/70"
      }`}
    >
      <span
        className={`h-4 w-[3px] shrink-0 rounded-full ${isActive ? "bg-brand-600" : "bg-transparent"}`}
      />
      <div
        className={`${isActive ? "!text-brand-600" : "text-gray-500 group-hover:text-gray-700"}`}
      >
        {icon}
      </div>
      <div className="flex flex-1 items-center justify-between">
        <span className="text-sm">{label}</span>
        {count && (
          <Badge size="sm" variant="light" color={isActive ? "teal" : "gray"}>
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
    label: React.ReactNode;
    children: React.ReactNode;
    menuKey: string;
    count?: number;
  }) => {
    const isExpanded = expandedMenus.has(menuKey);

    return (
      <div className="space-y-1">
        <UnstyledButton
          onClick={() => toggleMenu(menuKey)}
          className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors duration-200 hover:!bg-white/70"
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-500 group-hover:text-gray-700">
              {icon}
            </div>
            <div className="flex min-w-0 items-start gap-2">
              <Text
                size="sm"
                fw={600}
                className="leading-snug text-gray-700 group-hover:text-gray-900"
              >
                {label}
              </Text>
              {count && (
                <Badge
                  size="xs"
                  variant="light"
                  color="gray"
                  className="mt-0.5 shrink-0"
                >
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
      gray: "text-gray-500 hover:text-gray-700 hover:!bg-white/70",
      blue: "text-brand-500 hover:text-brand-700 hover:!bg-brand-50/70",
      green: "text-green-600 hover:text-green-700 hover:!bg-green-50/70",
      red: "text-red-500 hover:text-red-700 hover:!bg-red-50/70",
    };

    return (
      <UnstyledButton
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-200 ease-out hover:translate-x-0.5 ${colorClasses[color]}`}
      >
        {icon}
        <span>{label}</span>
      </UnstyledButton>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <aside className="glass-card fixed top-3 bottom-3 left-3 z-50 flex h-[calc(100%-1.5rem)] w-72 flex-col overflow-hidden !rounded-2xl">
        {/* Header */}
        <div className="border-b border-gray-100/70 p-4">
          <div className="flex items-center gap-3">
            <div className="from-brand-500 to-brand-700 shadow-brand-600/30 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
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

        {/* Sélecteur de périmètre actif */}
        {user && (
          <div className="border-b border-gray-100/70 p-3">
            <Menu shadow="md" width={260} position="bottom-start">
              <Menu.Target>
                <UnstyledButton className="btn-glass flex w-full items-center !justify-start gap-3 !rounded-xl !px-3 !py-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: activePerimeter?.color ?? "#94a3b8",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <Text size="xs" className="text-gray-500">
                      Périmètre actif
                    </Text>
                    <Text size="sm" fw={600} className="truncate text-gray-900">
                      {activePerimeter?.title ?? "Aucun périmètre"}
                    </Text>
                  </div>
                  <IconChevronDown size={14} className="text-gray-400" />
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Mes périmètres</Menu.Label>
                {mine?.perimeters.length ? (
                  mine.perimeters.map((p) => (
                    <Menu.Item
                      key={p.id}
                      leftSection={
                        <span
                          className="block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                      }
                      rightSection={
                        p.id === mine.activePerimeterId ? (
                          <IconCheck size={14} className="text-brand-600" />
                        ) : null
                      }
                      onClick={() => {
                        if (p.id !== mine.activePerimeterId) {
                          setActive.mutate(
                            { perimeterId: p.id },
                            {
                              onSuccess: () => {
                                // If we're on a survey admin page, follow the new
                                // active perimeter instead of staying on the old one
                                if (
                                  pathname.startsWith("/sondage/") &&
                                  pathname.endsWith("/admin")
                                ) {
                                  router.push(`/sondage/${p.slug}/admin`);
                                }
                              },
                            },
                          );
                        }
                      }}
                    >
                      {p.title}
                    </Menu.Item>
                  ))
                ) : (
                  <Menu.Item disabled>Aucun périmètre</Menu.Item>
                )}
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLayoutDashboard size={14} />}
                  onClick={() => router.push("/perimetres")}
                >
                  Gérer les périmètres
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        )}

        {/* Profil utilisateur */}
        {user && (
          <div className="border-b border-gray-100/70 p-4">
            <div className="flex items-center gap-3">
              <Avatar
                size="md"
                radius="xl"
                className="bg-brand-100 text-brand-700"
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
              isActive={pathname === "/"}
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
                icon={<IconTrash size={16} />}
                label="Supprimer des Modules"
                onClick={() => router.push("/modules/delete")}
                color="red"
              />
            </MenuSection>

            <MenuSection
              icon={<IconUsers size={20} />}
              label={
                <>
                  Enseignants
                  <br />
                  (base commune)
                </>
              }
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
              icon={<IconLayoutDashboard size={20} />}
              label="Périmètres"
              menuKey="perimeters"
            >
              <SubMenuItem
                icon={<IconSettings size={16} />}
                label="Gérer les Périmètres"
                onClick={() => router.push("/perimetres")}
              />
            </MenuSection>

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

            {ENABLE_SONDAGE && (
              <>
                <div className="my-4">
                  <div className="mx-3 h-px bg-gray-100" />
                </div>

                <MenuSection
                  icon={<IconClipboardList size={20} />}
                  label="Questionnaire"
                  menuKey="sondage"
                >
                  <SubMenuItem
                    icon={<IconExternalLink size={16} />}
                    label="Formulaire public"
                    onClick={() => router.push("/sondage")}
                    color="blue"
                  />
                  <SubMenuItem
                    icon={<IconSettings size={16} />}
                    label="Administration"
                    onClick={() =>
                      router.push(
                        activePerimeter
                          ? `/sondage/${activePerimeter.slug}/admin`
                          : "/sondage",
                      )
                    }
                  />
                </MenuSection>
              </>
            )}

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
        <div className="space-y-1 border-t border-gray-100/70 p-3">
          <UnstyledButton
            onClick={() => setAboutModal(true)}
            className="surface-hover flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-medium text-gray-500 hover:!bg-white/70 hover:text-gray-700"
          >
            <IconInfoCircle size={16} />
            <span className="text-xs">À propos</span>
          </UnstyledButton>
          <UnstyledButton
            onClick={handleLogout}
            className="surface-hover flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium text-red-600 hover:!bg-red-50/80"
          >
            <IconLogout size={20} />
            <span className="text-sm">Déconnexion</span>
          </UnstyledButton>
        </div>
      </aside>

      <AboutModal opened={aboutModal} onClose={() => setAboutModal(false)} />
    </>
  );
};

export default Sidebar;
