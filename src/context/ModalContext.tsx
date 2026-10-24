import React, { useState, type ReactNode } from 'react';
import type { PendingFeatureDetail } from '../types';
import { ModalContext } from './modalContextDef';

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
