"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSidebar } from "@/contexts/sidebar";
import { useEffect, useRef } from "react";
import {
  FaHome,
  FaBook,
  FaUsers,
  FaBookmark,
  FaDiscord,
  FaTwitter,
  FaReddit,
  FaGithub,
  FaBars,
  FaThumbtack,
} from "react-icons/fa";
import { Constants } from "@/constants";
import { twMerge } from "tailwind-merge";

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  active?: boolean;
  external?: boolean;
  subItems?: { title: string; href: string; active?: boolean }[];
}

export default function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isOpen, toggleSidebar, setIsOpen } = useSidebar();

  const currentTab = searchParams.get("tab");

  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setIsOpen(false);
      }
    };

    // Check on mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  // Auto-close sidebar when pathname or searchParams change (mobile only)
  useEffect(() => {
    // Only close on mobile (screen width < 1024px / lg breakpoint)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [pathname, searchParams, setIsOpen]);

  // Click outside to close sidebar (mobile only)
  const sidebarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close on mobile (screen width < 1024px / lg breakpoint)
      if (window.innerWidth < 1024 && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const navItems: NavItem[] = [
    {
      title: "Home",
      href: Constants.Routes.nettrom.index,
      icon: FaHome,
      active: pathname === Constants.Routes.nettrom.index,
    },
    {
      title: "Follows",
      icon: FaBookmark,
      active: false, // Category header không active khi có sub-items
      subItems: [
        {
          title: "Updates",
          href: Constants.Routes.nettrom.following,
          active: pathname === Constants.Routes.nettrom.following && (!currentTab || currentTab === "following" || currentTab === "sync"),
        },
        {
          title: "Library",
          href: Constants.Routes.nettrom.library,
          active: pathname === Constants.Routes.nettrom.library,
        },
        {
          title: "MDLists",
          href: `${Constants.Routes.nettrom.following}?tab=lists`,
          active: pathname === Constants.Routes.nettrom.following && currentTab === "lists",
        },
        {
          title: "My Groups",
          href: `${Constants.Routes.nettrom.following}?tab=groups`,
          active: pathname === Constants.Routes.nettrom.following && currentTab === "groups",
        },
        {
          title: "Reading History",
          href: Constants.Routes.nettrom.history,
          active: pathname === Constants.Routes.nettrom.history,
        },
      ],
    },
    {
      title: "Titles",
      icon: FaBook,
      active: false, // Category header không active khi có sub-items
      subItems: [
        {
          title: "Advanced Search",
          href: Constants.Routes.nettrom.search,
          active: pathname === Constants.Routes.nettrom.search || pathname?.startsWith(Constants.Routes.nettrom.search),
        },
        {
          title: "Recently Added",
          href: "/recently-added",
          active: pathname === "/recently-added" || pathname?.startsWith("/recently-added"),
        },
        {
          title: "Latest Updates",
          href: "/latest-updates",
          active: pathname === "/latest-updates" || pathname?.startsWith("/latest-updates"),
        },
        {
          title: "Random",
          href: Constants.Routes.nettrom.random,
          active: pathname === Constants.Routes.nettrom.random,
        },
      ],
    },
    {
      title: "Community",
      icon: FaUsers,
      subItems: [
        {
          title: "Forums",
          href: "#",
        },
        {
          title: "Groups",
          href: "#",
        },
        {
          title: "Users",
          href: "#",
        },
      ],
    },
    {
      title: "MangaDex",
      icon: FaThumbtack,
      subItems: [
        {
          title: "Community Guidelines",
          href: "#",
          active: false,
        },
        {
          title: "Announcements",
          href: "#",
          active: false,
        },
        {
          title: "About Us",
          href: Constants.Routes.nettrom.about,
          active: pathname === Constants.Routes.nettrom.about,
        },
        {
          title: "Contact",
          href: Constants.Routes.nettrom.contact,
          active: pathname === Constants.Routes.nettrom.contact,
        },
        {
          title: "Advertise",
          href: "#",
          active: false,
        },
      ],
    },
  ];

  const socialLinks = [
    { icon: FaDiscord, href: "https://discord.gg/mangadex", label: "Discord" },
    {
      icon: FaTwitter,
      href: "https://twitter.com/mangadex",
      label: "Twitter/X",
    },
    { icon: FaReddit, href: "https://reddit.com/r/mangadex", label: "Reddit" },
    { icon: FaGithub, href: "https://github.com/mangadex", label: "GitHub" },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[50] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        className={twMerge(
          "fixed left-0 top-0 z-[60] h-screen flex flex-col bg-neutral-800 transition-all duration-300",
          isOpen ? "w-96" : "w-0 overflow-hidden",
        )}
      >
      {/* Logo/Brand Header - Chỉ hiển thị khi sidebar mở */}
      {isOpen && (
        <div className="flex items-center justify-between px-12 pt-5 pb-5 pointer-events-auto">
          <Link
            href={Constants.Routes.nettrom.index}
            className="flex items-center gap-3 text-white transition-colors hover:text-orange-500 no-underline"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-orange-500">
              <FaBook className="h-6 w-6 text-white" />
            </div>
            <span className="whitespace-nowrap text-2xl font-bold">
              {Constants.APP_NAME}
            </span>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSidebar();
            }}
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-white cursor-pointer"
            aria-label="Toggle sidebar"
            type="button"
            style={{ zIndex: 100 }}
          >
            <FaBars className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 pointer-events-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;
            const hasSubItems = item.subItems && item.subItems.length > 0;

            if (hasSubItems) {
              // Category header không bao giờ active khi có sub-items
              return (
                <li key={item.title}>
                  <div className="rounded-lg px-4 py-1 text-3xl font-semibold text-neutral-200">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 flex-shrink-0" />
                      {isOpen && <span>{item.title}</span>}
                    </div>
                  </div>
                  {isOpen && (
                    <ul className="ml-4 mt-1 space-y-1 border-l-2 border-neutral-700 pl-4">
                      {item.subItems!.map((subItem) => (
                        <li key={subItem.title}>
                          <Link
                            href={subItem.href}
                            className={twMerge(
                              "text-medium block rounded-lg px-4 py-2 no-underline transition-colors",
                              subItem.active
                                ? "bg-orange-500 font-semibold text-white"
                                : "text-neutral-400 hover:bg-neutral-700/50 hover:text-white",
                            )}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.title}>
                <Link
                  href={item.href || "#"}
                  className={twMerge(
                    "flex items-center gap-3 rounded-lg px-4 py-2 text-3xl font-semibold transition-colors no-underline",
                    isActive
                      ? "bg-orange-500 text-white"
                      : "text-neutral-200 hover:bg-neutral-700 hover:text-white",
                  )}
                  title={!isOpen ? item.title : undefined}
                >
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  {isOpen && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Always at bottom */}
      {isOpen && (
        <div className="mt-auto border-t border-neutral-700 p-4 pointer-events-auto">
          {/* Social Links */}
          <div className="mb-4 flex items-center justify-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 transition-colors hover:text-white"
                  aria-label={social.label}
                >
                  <Icon className="h-6 w-6" />
                </a>
              );
            })}
          </div>

          {/* Version and Copyright */}
          <div className="space-y-1 text-center">
            <p className="text-sm text-neutral-500">v{Constants.APP_VERSION}</p>
            <p className="text-sm text-neutral-500">
              © {Constants.APP_NAME} {new Date().getFullYear()}
            </p>
            <Link
              href="#"
              className="text-xl text-neutral-400 transition-colors hover:text-white no-underline"
            >
              Terms & Policies
            </Link>
          </div>
        </div>
      )}
    </aside>
    </>
  );
}
