"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { IconLayoutDashboard, IconArrowRight } from "@tabler/icons-react";
import { useAuth } from "~/contexts/AuthContext";
import { useModal } from "~/contexts/ModalContext";
import { usePathname } from "next/navigation";
import { api } from "~/trpc/react";
import Sidebar from "./Sidebar";
import { CreatePromoModal, CreateModuleModal } from "./modals";

interface AppLayoutProps {
  children: React.ReactNode;
}

function NoActivePerimeterScreen() {
  const router = useRouter();
  const { data: mine } = api.perimeters.getMine.useQuery();
  const perimeters = mine?.perimeters ?? [];
  const setActive = api.perimeters.setActive.useMutation({
    onSuccess: () => window.location.reload(),
  });

  return (
    <div className="from-brand-50 flex h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-white to-white p-6">
      <div className="glass-card w-full max-w-md p-8 text-center">
        <div className="bg-brand-100 text-brand-600 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
          <IconLayoutDashboard size={28} />
        </div>
        <h1 className="text-lg font-semibold text-gray-900">
          Aucun périmètre actif
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Choisissez un périmètre pour continuer, ou rendez-vous dans la gestion
          des périmètres.
        </p>

        {perimeters.length > 0 ? (
          <div className="mt-6 space-y-2 text-left">
            {perimeters.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive.mutate({ perimeterId: p.id })}
                disabled={setActive.isPending}
                className="btn-glass flex w-full items-center gap-3 disabled:opacity-50"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span className="flex-1 truncate text-sm font-medium">
                  {p.title}
                </span>
                <IconArrowRight size={14} className="text-gray-400" />
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => router.push("/perimetres")}
            className="btn-primary mt-6 w-full justify-center"
          >
            Gerer les périmètres
          </button>
        )}
      </div>
    </div>
  );
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const {
    createPromoModal,
    createModuleModal,
    createModuleInitialPromoId,
    setCreatePromoModal,
    setCreateModuleModal,
  } = useModal();
  const pathname = usePathname();

  // Pages où on ne veut pas afficher la sidebar
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isPublicSurveyRoute =
    pathname === "/sondage" ||
    (pathname.startsWith("/sondage/") && !pathname.endsWith("/admin"));
  const shouldShowSidebar =
    isAuthenticated && !isAuthRoute && !isPublicSurveyRoute;

  const { data: mine } = api.perimeters.getMine.useQuery(undefined, {
    enabled: shouldShowSidebar,
  });

  if (loading) {
    return children;
  }

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  const needsPerimeter =
    mine !== undefined && !mine.activePerimeterId && pathname !== "/perimetres";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main content */}
      <div className="ml-[19.5rem] flex-1 overflow-auto py-3 pr-3">
        {needsPerimeter ? <NoActivePerimeterScreen /> : children}
      </div>

      {/* Global Modals */}
      <CreatePromoModal
        isOpen={createPromoModal}
        onClose={() => setCreatePromoModal(false)}
        onSuccess={() => {
          // Optionellement, on peut naviguer vers la page des promos après création
          // router.push("/promos");
        }}
      />

      <CreateModuleModal
        isOpen={createModuleModal}
        onClose={() => setCreateModuleModal(false)}
        initialPromoId={createModuleInitialPromoId}
        onSuccess={() => {
          // Optionellement, on peut naviguer vers la page des modules après création
          // router.push("/modules");
        }}
      />
    </div>
  );
};

export default AppLayout;
