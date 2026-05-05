import React, { createContext, useContext, useState } from "react";

interface AuthState {
  userId: string | null;
  userName: string;
  signIn: (userId: string, name: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState>({
  userId: null,
  userName: "",
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");

  const signIn = (id: string, name: string) => {
    setUserId(id);
    setUserName(name);
  };

  const signOut = () => {
    setUserId(null);
    setUserName("");
  };

  return (
    <AuthContext.Provider value={{ userId, userName, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
