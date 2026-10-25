import { createContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { UserAccountDoc } from '../services/firebaseService';

export interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserAccountDoc | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, pass: string) => Promise<UserAccountDoc | null>;
  register: (username: string, email: string, pass: string) => Promise<UserAccountDoc>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
