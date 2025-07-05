"use client";

import React from "react";
import { useAuth } from "~/contexts/AuthContext";
import { useModal } from "~/contexts/ModalContext";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { CreatePromoModal, CreateModuleModal } from "./modals";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const {
    createPromoModal,
    createModuleModal,
    setCreatePromoModal,
    setCreateModuleModal,
  } = useModal();
  const pathname = usePathname();

  // Pages où on ne veut pas afficher la sidebar
  const hideSidebarRoutes = ["/login", "/register"];
  const shouldShowSidebar =
    isAuthenticated && !hideSidebarRoutes.includes(pathname);

  if (loading) {
    return children;
  }

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main content */}
      <div className="ml-72 flex-1 overflow-auto">{children}</div>

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
        onSuccess={() => {
          // Optionellement, on peut naviguer vers la page des modules après création
          // router.push("/modules");
        }}
      />
    </div>
  );
};

export default AppLayout;
