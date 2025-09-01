"use client";

import { ReactNode, useState } from "react";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminAuthProvider } from "@/contexts/admin-auth";
import { AdminSettingsProvider } from "@/contexts/admin-settings";
import { AdminTitle } from "@/components/admin/AdminTitle";
import { AdminGuard } from "@/components/admin/AdminGuard";
import "./globals.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50">
        <AdminAuthProvider>
          <AdminSettingsProvider>
            <AdminGuard>
              <AdminTitle />
              <div className="flex min-h-screen">
                {/* Sidebar */}
                <AdminSidebar
                  collapsed={sidebarCollapsed}
                  onToggle={toggleSidebar}
                />

                {/* Main Content */}
                <div className="flex min-w-0 flex-1 flex-col">
                  {/* Top Navbar */}
                  <AdminNavbar onToggleSidebar={toggleSidebar} />

                  {/* Page Content */}
                  <main className="flex-1 overflow-auto p-6">{children}</main>
                </div>
              </div>
            </AdminGuard>
          </AdminSettingsProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
