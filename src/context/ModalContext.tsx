import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { PendingFeatureDetail } from '../types';

interface ModalContextType {
  pendingModal: PendingFeatureDetail | null;
  openPendingModal: (detail: PendingFeatureDetail) => void;
  closePendingModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pendingModal, setPendingModal] = useState<PendingFeatureDetail | null>(null);

  const openPendingModal = (detail: PendingFeatureDetail) => {
    setPendingModal(detail);
  };

  const closePendingModal = () => {
    setPendingModal(null);
  };

  return (
    <ModalContext.Provider value={{ pendingModal, openPendingModal, closePendingModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
