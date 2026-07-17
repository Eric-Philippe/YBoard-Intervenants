"use client";

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface ModalContextType {
  createPromoModal: boolean;
  createModuleModal: boolean;
  createUserModal: boolean;
  createModuleInitialPromoId: string | undefined;
  setCreatePromoModal: (open: boolean) => void;
  setCreateModuleModal: (open: boolean) => void;
  setCreateUserModal: (open: boolean) => void;
  openCreatePromoModal: () => void;
  openCreateModuleModal: (initialPromoId?: string) => void;
  openCreateUserModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [createPromoModal, setCreatePromoModal] = useState(false);
  const [createModuleModal, setCreateModuleModalState] = useState(false);
  const [createUserModal, setCreateUserModal] = useState(false);
  const [createModuleInitialPromoId, setCreateModuleInitialPromoId] = useState<
    string | undefined
  >(undefined);

  const openCreatePromoModal = () => setCreatePromoModal(true);
  const openCreateModuleModal = (initialPromoId?: string) => {
    setCreateModuleInitialPromoId(initialPromoId);
    setCreateModuleModalState(true);
  };
  const openCreateUserModal = () => setCreateUserModal(true);

  const setCreateModuleModal = (open: boolean) => {
    if (!open) setCreateModuleInitialPromoId(undefined);
    setCreateModuleModalState(open);
  };

  const value: ModalContextType = {
    createPromoModal,
    createModuleModal,
    createUserModal,
    createModuleInitialPromoId,
    setCreatePromoModal,
    setCreateModuleModal,
    setCreateUserModal,
    openCreatePromoModal,
    openCreateModuleModal,
    openCreateUserModal,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
