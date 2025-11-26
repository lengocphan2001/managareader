"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FaBook,
  FaCog,
  FaList,
  FaPencilAlt,
  FaSignOutAlt,
  FaUser,
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
        isOpen ? "left-0 right-0 lg:left-96" : "left-0 right-0",
        scrolled
          ? "border-b border-neutral-700 bg-neutral-800"
          : "bg-transparent",
      )}
      id="header"
    >
      <div className="flex w-full max-w-full items-center justify-between gap-4 px-6 py-3">
        {/* Left side - Hamburger Menu & Logo - Chỉ hiển thị khi sidebar đóng */}
        {!isOpen && (
          <div className="flex shrink-0 items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-white shadow-lg transition-all duration-200 hover:border-orange-500/50 hover:bg-neutral-700 hover:text-orange-500 hover:shadow-orange-500/20"
              aria-label="Toggle sidebar"
              type="button"
            >
              <FaThLarge className="h-6 w-6" />
            </button>
            <Link
              className="flex items-center gap-2 text-white no-underline transition-colors hover:text-orange-500"
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
        <div className="flex shrink-0 items-center gap-4 overflow-visible">
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
  const isFollowingActive =
    pathname === Constants.Routes.nettrom.following &&
    (!currentTab || currentTab === "following" || currentTab === "sync");
  const isListsActive =
    pathname === Constants.Routes.nettrom.following && currentTab === "lists";
  const isGroupsActive =
    pathname === Constants.Routes.nettrom.following && currentTab === "groups";

  return (
    <div className="relative flex-shrink-0">
      <Menu>
        <MenuButton className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 text-white shadow-lg transition-all duration-200 hover:border-orange-500/50 hover:bg-neutral-700 hover:shadow-orange-500/20">
          {user?.avatar_path ? (
            <img
              src={avatarUrl}
              alt={user?.name || "User"}
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            <FaUser className="h-7 w-7" />
          )}
        </MenuButton>
        <MenuItems
          className="fixed z-[100] mr-4 mt-2 min-w-[300px] max-w-[300px] overflow-hidden rounded-xl border border-neutral-700/50 bg-neutral-900/95 shadow-2xl backdrop-blur-sm"
          anchor="bottom end"
        >
          {user ? (
            <>
              {/* User Profile Section */}
              <div className="border-b border-neutral-700/50 bg-gradient-to-r from-neutral-800/50 to-transparent px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-neutral-700 ring-2 ring-neutral-600">
                    {user?.avatar_path ? (
                      <img
                        src={avatarUrl}
                        alt={user?.name || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FaUser className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 truncate text-2xl font-bold text-white">
                      {user?.name || "User"}
                    </div>
                    <div>
                      <span className="inline-flex items-center rounded-md border border-white/30 bg-black/80 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        User
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 py-3">
                <MenuItem>
                  <Link
                    href={Constants.Routes.dashboard.index}
                    className={menuItemClassName(isProfileActive)}
                  >
                    <FaUser className="h-5 w-5 shrink-0" />
                    <span>My Profile</span>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    className={menuItemClassName(isFollowingActive)}
                    href={Constants.Routes.nettrom.following}
                  >
                    <FaBook className="h-5 w-5 shrink-0" />
                    <span>My Follows</span>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    className={menuItemClassName(isListsActive)}
                    href={`${Constants.Routes.nettrom.following}?tab=lists`}
                  >
                    <FaList className="h-5 w-5 shrink-0" />
                    <span>My Lists</span>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    className={menuItemClassName(isGroupsActive)}
                    href={`${Constants.Routes.nettrom.following}?tab=groups`}
                  >
                    <FaUsers className="h-5 w-5 shrink-0" />
                    <span>My Groups</span>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link className={menuItemClassName()} href="#">
                    <FaBullhorn className="h-5 w-5 shrink-0" />
                    <span>My Reports</span>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link className={menuItemClassName()} href="#">
                    <FaInfoCircle className="h-5 w-5 shrink-0" />
                    <span>Announcements</span>
                  </Link>
                </MenuItem>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-700/50"></div>

              {/* Settings Section */}
              <div className="space-y-1 py-3">
                <MenuItem>
                  <button
                    className={menuItemClassName()}
                    onClick={onToggleDrawer}
                  >
                    <FaCog className="h-5 w-5 shrink-0" />
                    <span>Settings</span>
                  </button>
                </MenuItem>
                <MenuItem>
                  <button
                    className={menuItemClassName()}
                    onClick={onToggleDrawer}
                  >
                    <FaTint className="h-5 w-5 shrink-0" />
                    <span>Theme</span>
                  </button>
                </MenuItem>
                <MenuItem>
                  <div className="group mx-2 flex w-full cursor-pointer items-center justify-between rounded-lg px-6 py-4 text-neutral-200 transition-all duration-200 hover:bg-neutral-700/50 hover:text-white">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-medium">
                        Interface Language
                      </span>
                    </div>
                    <span className="rounded-md border border-orange-400/30 bg-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition-colors group-hover:bg-orange-400">
                      BETA
                    </span>
                  </div>
                </MenuItem>
                <MenuItem>
                  <div className="group mx-2 flex w-full cursor-pointer items-center justify-between rounded-lg px-6 py-4 text-neutral-200 transition-all duration-200 hover:bg-neutral-700/50 hover:text-white">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-medium">
                        Chapter Languages
                      </span>
                    </div>
                    <span className="rounded-md border border-neutral-600/50 bg-neutral-700/80 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition-colors group-hover:bg-neutral-600">
                      All
                    </span>
                  </div>
                </MenuItem>
                <MenuItem>
                  <button
                    className={menuItemClassName()}
                    onClick={onToggleDrawer}
                  >
                    <span>Content Filter</span>
                  </button>
                </MenuItem>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-700/50"></div>

              {/* Sign Out */}
              <div className="space-y-1 py-3">
                <MenuItem>
                  <button
                    className={`${menuItemClassName()} text-red-400 hover:bg-red-500/10 hover:text-red-300`}
                    onClick={logout}
                  >
                    <FaSignOutAlt className="h-5 w-5 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </MenuItem>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1 py-3">
                <MenuItem>
                  <Link
                    className={menuItemClassName()}
                    href={Constants.Routes.login}
                  >
                    <FaUser className="h-5 w-5 shrink-0" />
                    <span>Login</span>
                  </Link>
                </MenuItem>
                <MenuItem>
                  <Link
                    className={menuItemClassName()}
                    href={Constants.Routes.signup}
                  >
                    <FaPencilAlt className="h-5 w-5 shrink-0" />
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
