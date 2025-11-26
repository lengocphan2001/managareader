"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FaBook,
  FaCaretDown,
  FaCog,
  FaHistory,
  FaHome,
  FaList,
  FaPencilAlt,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaUsers,
  FaBullhorn,
  FaInfoCircle,
  FaTint,
  FaThLarge,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { useSidebar } from "@/contexts/sidebar";
import { twMerge } from "tailwind-merge";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useAuth } from "@/hooks/useAuth";
import { Constants } from "@/constants";
import { useSettingsContext } from "@/contexts/settings";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Utils } from "@/utils";

import MainNav from "./main-nav";
import SearchInput from "../common/search-input";

const menuItemClassName = (isActive?: boolean) =>
  `flex gap-4 items-center w-full text-white py-4 px-6 mx-2 rounded-lg text-2xl font-medium no-underline hover:no-underline transition-all duration-200 ${
    isActive
      ? "bg-neutral-700/80 text-white"
      : "hover:bg-neutral-700/50 text-neutral-200 hover:text-white"
  }`;

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isOpen, toggleSidebar } = useSidebar();

  // Get admin settings for logo from cached hook
  const { settings } = useAdminSettings();
  const adminLogoUrl = settings.logoUrl || "";

  const params = useSearchParams();

  useEffect(() => {
    setOpenMenu(false);
  }, [pathname, params]);

  // Handle scroll to show/hide background
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={twMerge(
        "fixed top-0 z-50 transition-all duration-300",
        isOpen ? "left-0 lg:left-96 right-0" : "left-0 right-0",
        scrolled
          ? "bg-neutral-800 border-b border-neutral-700"
          : "bg-transparent"
      )}
      id="header"
    >
      <div className="flex items-center justify-between gap-4 px-6 py-3 w-full max-w-full">
        {/* Left side - Hamburger Menu & Logo - Chỉ hiển thị khi sidebar đóng */}
        {!isOpen && (
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white hover:text-orange-500 transition-all duration-200 border border-neutral-700 hover:border-orange-500/50 shadow-lg hover:shadow-orange-500/20"
              aria-label="Toggle sidebar"
              type="button"
            >
              <FaThLarge className="w-6 h-6" />
            </button>
            <Link
              className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors no-underline"
              title="Online manga"
              href={Constants.Routes.nettrom.index}
            >
              {adminLogoUrl ? (
                <img
                  src={adminLogoUrl}
                  alt={Constants.APP_NAME}
                  className="h-8 w-8 flex-shrink-0 rounded object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-orange-500">
                  <FaBook className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="text-xl font-bold">{Constants.APP_NAME}</span>
            </Link>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right side - Search and User Profile */}
        <div className="flex items-center gap-4 shrink-0 overflow-visible">
          <div className="relative flex-shrink-0 overflow-visible">
            <SearchInput />
          </div>
          <div className="flex-shrink-0">
            <AuthDropdown desktop />
          </div>
        </div>
      </div>
    </header>
  );
}

function AuthDropdown({ desktop }: { desktop?: boolean }) {
  const { user, logout } = useAuth();
  const { onToggleDrawer } = useSettingsContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (user === undefined) return null;
  
  const avatarUrl = Utils.Url.getAvatarUrl(user?.avatar_path);
  const currentTab = searchParams.get("tab");
  
  // Determine active states
  const isProfileActive = pathname === Constants.Routes.dashboard.index;
  const isFollowingActive = pathname === Constants.Routes.nettrom.following && (!currentTab || currentTab === "following" || currentTab === "sync");
  const isListsActive = pathname === Constants.Routes.nettrom.following && currentTab === "lists";
  const isGroupsActive = pathname === Constants.Routes.nettrom.following && currentTab === "groups";
  
  return (
    <div className="relative flex-shrink-0">
      <Menu>
        <MenuButton className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-all duration-200 overflow-hidden border border-neutral-700 hover:border-orange-500/50 shadow-lg hover:shadow-orange-500/20 flex-shrink-0">
          {user?.avatar_path ? (
            <img
              src={avatarUrl}
              alt={user?.name || "User"}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <FaUser className="w-7 h-7" />
          )}
        </MenuButton>
        <MenuItems
          className="z-[100] mt-2 mr-4 min-w-[300px] max-w-[300px] rounded-xl bg-neutral-900/95 backdrop-blur-sm border border-neutral-700/50 shadow-2xl overflow-hidden fixed"
          anchor="bottom end"
        >
        {user ? (
          <>
            {/* User Profile Section */}
            <div className="px-6 py-5 border-b border-neutral-700/50 bg-gradient-to-r from-neutral-800/50 to-transparent">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-neutral-700 flex-shrink-0 ring-2 ring-neutral-600">
                  {user?.avatar_path ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaUser className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-bold text-white truncate mb-2">
                    {user?.name || "User"}
                  </div>
                  <div>
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-black/80 rounded-md border border-white/30 shadow-sm">
                      User
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="py-3 space-y-1">
              <MenuItem>
                <Link
                  href={Constants.Routes.dashboard.index}
                  className={menuItemClassName(isProfileActive)}
                >
                  <FaUser className="w-5 h-5 shrink-0" />
                  <span>My Profile</span>
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  className={menuItemClassName(isFollowingActive)}
                  href={Constants.Routes.nettrom.following}
                >
                  <FaBook className="w-5 h-5 shrink-0" />
                  <span>My Follows</span>
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  className={menuItemClassName(isListsActive)}
                  href={`${Constants.Routes.nettrom.following}?tab=lists`}
                >
                  <FaList className="w-5 h-5 shrink-0" />
                  <span>My Lists</span>
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  className={menuItemClassName(isGroupsActive)}
                  href={`${Constants.Routes.nettrom.following}?tab=groups`}
                >
                  <FaUsers className="w-5 h-5 shrink-0" />
                  <span>My Groups</span>
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  className={menuItemClassName()}
                  href="#"
                >
                  <FaBullhorn className="w-5 h-5 shrink-0" />
                  <span>My Reports</span>
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  className={menuItemClassName()}
                  href="#"
                >
                  <FaInfoCircle className="w-5 h-5 shrink-0" />
                  <span>Announcements</span>
                </Link>
              </MenuItem>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-700/50"></div>

            {/* Settings Section */}
            <div className="py-3 space-y-1">
              <MenuItem>
                <button className={menuItemClassName()} onClick={onToggleDrawer}>
                  <FaCog className="w-5 h-5 shrink-0" />
                  <span>Settings</span>
                </button>
              </MenuItem>
              <MenuItem>
                <button className={menuItemClassName()} onClick={onToggleDrawer}>
                  <FaTint className="w-5 h-5 shrink-0" />
                  <span>Theme</span>
                </button>
              </MenuItem>
              <MenuItem>
                <div className="flex items-center justify-between w-full py-4 px-6 mx-2 rounded-lg text-neutral-200 hover:bg-neutral-700/50 hover:text-white transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-medium">Interface Language</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold text-white bg-orange-500 rounded-md border border-orange-400/30 shadow-sm group-hover:bg-orange-400 transition-colors">
                    BETA
                  </span>
                </div>
              </MenuItem>
              <MenuItem>
                <div className="flex items-center justify-between w-full py-4 px-6 mx-2 rounded-lg text-neutral-200 hover:bg-neutral-700/50 hover:text-white transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-medium">Chapter Languages</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold text-white bg-neutral-700/80 rounded-md border border-neutral-600/50 shadow-sm group-hover:bg-neutral-600 transition-colors">
                    All
                  </span>
                </div>
              </MenuItem>
              <MenuItem>
                <button className={menuItemClassName()} onClick={onToggleDrawer}>
                  <span>Content Filter</span>
                </button>
              </MenuItem>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-700/50"></div>

            {/* Sign Out */}
            <div className="py-3 space-y-1">
              <MenuItem>
                <button className={`${menuItemClassName()} text-red-400 hover:text-red-300 hover:bg-red-500/10`} onClick={logout}>
                  <FaSignOutAlt className="w-5 h-5 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </MenuItem>
            </div>
          </>
        ) : (
          <>
            <div className="py-3 space-y-1">
              <MenuItem>
                <Link
                  className={menuItemClassName()}
                  href={Constants.Routes.login}
                >
                  <FaUser className="w-5 h-5 shrink-0" />
                  <span>Login</span>
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  className={menuItemClassName()}
                  href={Constants.Routes.signup}
                >
                  <FaPencilAlt className="w-5 h-5 shrink-0" />
                  <span>Sign Up</span>
                </Link>
              </MenuItem>
            </div>
          </>
        )}
      </MenuItems>
    </Menu>
    </div>
  );
}
