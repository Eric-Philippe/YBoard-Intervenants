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
  setCreatePromoModal: (open: boolean) => void;
  setCreateModuleModal: (open: boolean) => void;
  setCreateUserModal: (open: boolean) => void;
  openCreatePromoModal: () => void;
  openCreateModuleModal: () => void;
  openCreateUserModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [createPromoModal, setCreatePromoModal] = useState(false);
  const [createModuleModal, setCreateModuleModal] = useState(false);
  const [createUserModal, setCreateUserModal] = useState(false);

  const openCreatePromoModal = () => setCreatePromoModal(true);
  const openCreateModuleModal = () => setCreateModuleModal(true);
  const openCreateUserModal = () => setCreateUserModal(true);

  const value: ModalContextType = {
    createPromoModal,
    createModuleModal,
    createUserModal,
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
