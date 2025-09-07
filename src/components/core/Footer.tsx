"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Constants } from "@/constants";
import ScriptInjector from "./ScriptInjector";

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
  injectScripts = true,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Get admin settings for footer logo
  const [adminFooterLogoUrl, setAdminFooterLogoUrl] = useState("");

  useEffect(() => {
    const loadAdminFooterLogo = async () => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/admin/get-settings`);

        if (response.ok) {
          const data = await response.json();
          setAdminFooterLogoUrl(data.footerLogoUrl || "");
        } else {
          console.log("Failed to load admin settings from API for footer logo");
        }
      } catch (error) {
        console.error("Error loading admin settings for footer logo:", error);
      }
    };

    loadAdminFooterLogo();
  }, []);

  // Minimal footer for admin or simple pages
  if (variant === "minimal") {
    return (
      <>
        <footer
          className={`footer border-t bg-gray-50 dark:bg-gray-900 ${className}`}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Copyright © {currentYear}{" "}
                <Link
                  href="/"
                  className="text-indigo-600 hover:underline dark:text-indigo-400"
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
        <footer
          className={`border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${className}`}
        >
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>
                  Copyright © {currentYear}{" "}
                  <Link
                    href="/"
                    className="text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {Constants.APP_NAME}
                  </Link>{" "}
                  Admin Panel
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <Link
                  href="/"
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Back to Site
                </Link>
                <Link
                  href={Constants.Routes.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
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
                  <h6 className="mb-3 font-semibold text-white">Quick Links</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <Link
                        href="/nettrom"
                        className="text-gray-300 transition-colors hover:text-white"
                      >
                        Home
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href="/nettrom/advanced-search"
                        className="text-gray-300 transition-colors hover:text-white"
                      >
                        Advanced Search
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href="/nettrom/following"
                        className="text-gray-300 transition-colors hover:text-white"
                      >
                        Following
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href="/nettrom/history"
                        className="text-gray-300 transition-colors hover:text-white"
                      >
                        Reading History
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="col-sm-3">
                  <h6 className="mb-3 font-semibold text-white">Account</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <Link
                        href="/login"
                        className="text-gray-300 transition-colors hover:text-white"
                      >
                        Login
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href="/signup"
                        className="text-gray-300 transition-colors hover:text-white"
                      >
                        Sign Up
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href="/profile"
                        className="text-gray-300 transition-colors hover:text-white"
                      >
                        Profile
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="col-sm-3">
                  <h6 className="mb-3 font-semibold text-white">Support</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <Link
                        href={Constants.Routes.report}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 transition-colors hover:text-white"
                      >
                        Report Issue
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href={Constants.Routes.hako}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 transition-colors hover:text-white"
                      >
                        Hako
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="col-sm-3">
                  <h6 className="mb-3 font-semibold text-white">About</h6>
                  <p className="text-sm text-gray-300">
                    {Constants.APP_NAME} is a modern manga reading platform
                    built with Next.js and powered by MangaDex API.
                  </p>
                  <div className="mt-3">
                    <span className="text-xs text-gray-400">
                      Version {Constants.APP_VERSION}
                    </span>
                  </div>
                  {showSocialLinks && (
                    <div className="mt-4">
                      <h6 className="mb-2 font-semibold text-white">
                        Follow Us
                      </h6>
                      <div className="flex space-x-3">
                        <Link
                          href={Constants.Routes.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 transition-colors hover:text-white"
                          title="GitHub"
                        >
                          <i className="fab fa-github text-lg"></i>
                        </Link>
                        <Link
                          href={Constants.Routes.report}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 transition-colors hover:text-white"
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
