import React, { useState, useEffect, type ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  subscribeAuthState,
  fetchUserProfile,
  loginWithFirebase,
  registerWithFirebase,
  logoutFirebase,
  sendPasswordReset,
  getActiveLocalSession,
  type UserAccountDoc,
} from '../services/firebaseService';
import { AuthContext } from './authContextDef';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserAccountDoc | null>(() => getActiveLocalSession());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuthState(async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await fetchUserProfile(user.uid);
          setUserProfile(profile);
        } catch {
          setUserProfile(getActiveLocalSession());
        }
      } else {
        setUserProfile(getActiveLocalSession());
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (emailOrUsername: string, pass: string): Promise<UserAccountDoc | null> => {
    const profile = await loginWithFirebase(emailOrUsername, pass);
    setUserProfile(profile);
    return profile;
  };

  const register = async (
    username: string,
    email: string,
    pass: string
  ): Promise<UserAccountDoc> => {
    const profile = await registerWithFirebase(username, email, pass);
    setUserProfile(profile);
    return profile;
  };

  const logout = async (): Promise<void> => {
    await logoutFirebase();
    setUserProfile(null);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordReset(email);
  };

  const isAuthenticated = Boolean(currentUser || userProfile);

  const refreshProfile = async (): Promise<void> => {
    const activeUid = currentUser?.uid || userProfile?.uid;
    if (activeUid) {
      const profile = await fetchUserProfile(activeUid);
      setUserProfile(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
