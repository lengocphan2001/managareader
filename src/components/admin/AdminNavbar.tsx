"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  User,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/contexts/admin-auth";
import { useAdminSettings } from "@/contexts/admin-settings";

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
}

export function AdminNavbar({ onToggleSidebar }: AdminNavbarProps) {
  const { adminUser, adminLogout } = useAdminAuth();
  const { settings } = useAdminSettings();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleLogout = async () => {
    await adminLogout();
    setShowUserMenu(false);
  };

  return (
    <nav className="h-16 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left side - Toggle and Brand */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="h-3 w-3 rounded-sm bg-orange-500"></div>
              <div className="h-3 w-3 rounded-sm bg-green-500"></div>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {settings.siteName} Admin
            </span>
          </div>
        </div>

        {/* Center - Search */}
        <div className="mx-8 max-w-md flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right side - Actions and User */}
        <div className="flex items-center space-x-4">
          {/* User Menu - Only show if user is authenticated */}
          {adminUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {adminUser.name}
                  </p>
                  <p className="text-xs text-gray-500">{adminUser.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {adminUser.name}
                    </p>
                    <p className="text-xs text-gray-500">{adminUser.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => router.push("/admin/profile")}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <User className="mr-3 h-4 w-4" />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={() => router.push("/admin/settings")}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Settings</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500">
              <User className="h-4 w-4" />
              <span className="text-sm">Not logged in</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
