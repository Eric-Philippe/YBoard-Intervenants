"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  last_connected?: Date | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loginMutation = api.auth.login.useMutation();
  const registerMutation = api.auth.register.useMutation();

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    // Check for existing session on mount
    if (typeof window !== "undefined") {
      try {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken && savedUser) {
          setToken(savedToken);
          const parsedUser = JSON.parse(savedUser) as User;
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to parse saved user data:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginMutation.mutateAsync({ email, password });

      setUser(response.user);
      setToken(response.token);

      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (userData: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await registerMutation.mutateAsync(userData);

      setUser(response.user);
      // Note: Register doesn't return a token, so we need to login after registration
      // or modify the backend to return a token

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      // Auto-login after registration
      await login(userData.email, userData.password);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    router.push("/login");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
