"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

import { app } from "@/app/firebase/config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = getAuth(app);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Register with Email/Password
  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Login with Email/Password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Login with Google
  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Logout
  const logout = () => {
    return signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, googleLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth easily
export const useAuth = () => useContext(AuthContext);
