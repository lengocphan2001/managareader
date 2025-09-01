"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/contexts/admin-auth";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { adminUser, isAdmin, isModerator, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      // If we're on the login page, don't redirect
      if (pathname === "/admin/login") {
        return;
      }

      if (!adminUser) {
        // Redirect to admin login if not authenticated
        router.push("/admin/login");
        return;
      }

      // Check if user has admin or moderator role
      if (!isAdmin && !isModerator) {
        // Redirect to main site if not admin/moderator
        router.push("/");
        return;
      }

      setIsAuthorized(true);
    }
  }, [adminUser, isAdmin, isModerator, loading, router, pathname]);

  // If we're on the login page, render children without protection
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
