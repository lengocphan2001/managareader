"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAdminSettings } from "@/contexts/admin-settings";

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({
  collapsed: externalCollapsed,
  onToggle,
}: AdminSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { settings } = useAdminSettings();

  // Sync with external collapsed state
  const collapsed =
    externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleExpanded = (item: string) => {
    setExpandedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: pathname === "/admin",
    },
  ];

  const adminNavigation = [
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      current: pathname === "/admin/users",
    },
    {
      name: "Comments",
      href: "/admin/comments",
      icon: MessageSquare,
      current: pathname === "/admin/comments",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: pathname === "/admin/settings",
    },
  ];

  return (
    <div
      className={`bg-gray-900 text-white transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="h-3 w-3 rounded-sm bg-orange-500"></div>
              <div className="h-3 w-3 rounded-sm bg-green-500"></div>
            </div>
            <span className="text-lg font-bold">{settings.siteName}</span>
          </div>
        )}
        <button
          onClick={handleToggle}
          className="rounded-md p-2 transition-colors hover:bg-gray-800"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        {/* Main Navigation */}
        <div className="mb-8">
          <h3
            className={`mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${
              collapsed ? "sr-only" : ""
            }`}
          >
            Main Navigation
          </h3>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      item.current
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`}
                    />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Admin Navigation */}
        <div className="mb-8">
          <h3
            className={`mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${
              collapsed ? "sr-only" : ""
            }`}
          >
            Admin Panel
          </h3>
          <ul className="space-y-1">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      item.current
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${collapsed ? "mx-auto" : "mr-3"}`}
                    />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
