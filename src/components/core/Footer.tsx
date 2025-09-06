"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Constants } from "@/constants";
import ScriptInjector from "./ScriptInjector";
import { useAdminSettings } from "@/contexts/admin-settings";

interface FooterProps {
  variant?: "default" | "minimal" | "admin";
  className?: string;
  showSocialLinks?: boolean;
  showNewsletter?: boolean;
  injectScripts?: boolean;
}

export default function Footer({ 
  variant = "default", 
  className = "",
  showSocialLinks = true,
  showNewsletter = false,
  injectScripts = true
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  // Get admin settings for footer logo
  const [adminFooterLogoUrl, setAdminFooterLogoUrl] = useState("");
  
  useEffect(() => {
    const loadAdminFooterLogo = () => {
      try {
        if (typeof window !== "undefined") {
          const savedSettings = localStorage.getItem("admin-settings");
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setAdminFooterLogoUrl(parsed.footerLogoUrl || "");
          }
        }
      } catch (error) {
        console.error("Error loading admin settings for footer logo:", error);
      }
    };

    loadAdminFooterLogo();

    // Listen for storage changes to update logo in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "admin-settings") {
        loadAdminFooterLogo();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Minimal footer for admin or simple pages
  if (variant === "minimal") {
    return (
      <>
        <footer className={`footer border-t bg-gray-50 dark:bg-gray-900 ${className}`}>
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Copyright © {currentYear}{" "}
                <Link
                  href="/"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {Constants.APP_NAME}
                </Link>
              </p>
            </div>
          </div>
        </footer>
        {injectScripts && <ScriptInjector type="footer" />}
      </>
    );
  }

  // Admin footer
  if (variant === "admin") {
    return (
      <>
        <footer className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${className}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>
                  Copyright © {currentYear}{" "}
                  <Link
                    href="/"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {Constants.APP_NAME}
                  </Link>{" "}
                  Admin Panel
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <Link
                  href="/"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Back to Site
                </Link>
                <Link
                  href={Constants.Routes.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </footer>
        {injectScripts && <ScriptInjector type="footer" />}
      </>
    );
  }

  // Default footer for nettrom layout
  return (
    <>
      <footer className={`footer border-t bg-[#000] ${className}`}>
        <div className="container">
          <div className="row">
            <div
              className="col-sm-4 copyright"
              itemType="http://schema.org/Organization"
            >
              <Link itemProp="url" href="/">
                <img
                  itemProp="logo"
                  src={adminFooterLogoUrl || "/images/logo-footer.png"}
                  alt={`${Constants.APP_NAME} - Online Manga`}
                  className="h-20 w-auto"
                />
              </Link>
              <div className="mrt10 row">
                <div className="col-xs-6">
                  {/* Future links can be added here */}
                </div>
              </div>
              <p></p>
              <p className="text-gray-300">
                Copyright © {currentYear}{" "}
                <Link
                  href="/"
                  className="text-web-title transition hover:!bg-transparent hover:bg-web-titleLighter hover:underline"
                >
                  {Constants.APP_NAME}
                </Link>
              </p>
            </div>
            <div className="col-sm-8">
              <div className="row">
                <div className="col-sm-3">
                  <h6 className="text-white font-semibold mb-3">Quick Links</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <Link
                        href="/nettrom"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Home
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href="/nettrom/advanced-search"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Advanced Search
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href="/nettrom/following"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Following
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href="/nettrom/history"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Reading History
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="col-sm-3">
                  <h6 className="text-white font-semibold mb-3">Account</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <Link
                        href="/login"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Login
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href="/signup"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Sign Up
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href="/profile"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Profile
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="col-sm-3">
                  <h6 className="text-white font-semibold mb-3">Support</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <Link
                        href={Constants.Routes.report}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Report Issue
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href={Constants.Routes.hako}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Hako
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="col-sm-3">
                  <h6 className="text-white font-semibold mb-3">About</h6>
                  <p className="text-gray-300 text-sm">
                    {Constants.APP_NAME} is a modern manga reading platform 
                    built with Next.js and powered by MangaDex API.
                  </p>
                  <div className="mt-3">
                    <span className="text-gray-400 text-xs">
                      Version {Constants.APP_VERSION}
                    </span>
                  </div>
                  {showSocialLinks && (
                    <div className="mt-4">
                      <h6 className="text-white font-semibold mb-2">Follow Us</h6>
                      <div className="flex space-x-3">
                        <Link
                          href={Constants.Routes.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white transition-colors"
                          title="GitHub"
                        >
                          <i className="fab fa-github text-lg"></i>
                        </Link>
                        <Link
                          href={Constants.Routes.report}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white transition-colors"
                          title="Report Issue"
                        >
                          <i className="fab fa-facebook-messenger text-lg"></i>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {injectScripts && <ScriptInjector type="footer" />}
    </>
  );
}
