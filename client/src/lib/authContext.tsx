import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "@shared/schema";
import { apiRequest } from "./queryClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("axo-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await apiRequest("POST", "/api/auth/login", { email, password });
    setUser(userData);
    localStorage.setItem("axo-user", JSON.stringify(userData));
  };

  const signup = async (email: string, password: string, name: string) => {
    const userData = await apiRequest("POST", "/api/auth/signup", { email, password, name });
    setUser(userData);
    localStorage.setItem("axo-user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("axo-user");
  };

  const isAdmin = user?.isAdmin ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
