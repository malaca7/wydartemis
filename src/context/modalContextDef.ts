import { createContext } from 'react';
import type { PendingFeatureDetail } from '../types';

export interface ModalContextType {
  pendingModal: PendingFeatureDetail | null;
  openPendingModal: (detail: PendingFeatureDetail) => void;
  closePendingModal: () => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);
