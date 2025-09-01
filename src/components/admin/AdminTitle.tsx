"use client";

import { useEffect } from "react";
import { useAdminSettings } from "@/contexts/admin-settings";

export function AdminTitle() {
  const { settings } = useAdminSettings();

  useEffect(() => {
    // Update document title when settings change
    document.title = `Admin Panel - ${settings.siteName}`;
  }, [settings.siteName]);

  return null; // This component doesn't render anything
}
