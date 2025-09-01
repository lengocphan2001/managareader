"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/admin-auth";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { adminUser, isAdmin, isModerator, loading } = useAdminAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
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
  }, [adminUser, isAdmin, isModerator, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
