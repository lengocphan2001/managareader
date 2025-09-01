"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { adminAPI, AdminUser } from "@/api/admin";

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user has admin privileges
  const isAdmin = adminUser?.display_roles?.includes("admin") || false;
  const isModerator = adminUser?.display_roles?.includes("mod") || false;

  useEffect(() => {
    // Check for existing admin session
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCurrentUser();
      const user = response.user;

      // Check if user has admin or moderator role
      if (
        user.display_roles?.includes("admin") ||
        user.display_roles?.includes("mod")
      ) {
        setAdminUser(user);
      }
    } catch (error) {
      console.error("Error checking admin session:", error);
      // Clear any invalid session
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await adminAPI.login(email, password);

      if (response.success) {
        const user = response.user;

        // Check if user has admin or moderator role
        if (
          user.display_roles?.includes("admin") ||
          user.display_roles?.includes("mod")
        ) {
          setAdminUser(user);
          // Store token for future requests
          localStorage.setItem("auth_token", response.token);
          return true;
        } else {
          throw new Error("User does not have admin privileges");
        }
      }

      return false;
    } catch (error) {
      console.error("Admin login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = async () => {
    try {
      await adminAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAdminUser(null);
      localStorage.removeItem("auth_token");
      router.push("/admin/login");
    }
  };

  const value: AdminAuthContextType = {
    adminUser,
    isAdmin,
    isModerator,
    loading,
    adminLogin,
    adminLogout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
