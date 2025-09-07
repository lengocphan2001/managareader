"use client";

import { useEffect, useState } from "react";

export default function FaviconUpdater() {
  const [faviconUrl, setFaviconUrl] = useState("");

  useEffect(() => {
    const loadFavicon = () => {
      try {
        if (typeof window !== "undefined") {
          const savedSettings = localStorage.getItem("admin-settings");
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            const newFaviconUrl = parsed.faviconUrl || "";
            if (newFaviconUrl !== faviconUrl) {
              setFaviconUrl(newFaviconUrl);
              updateFavicon(newFaviconUrl);
            }
          }
        }
      } catch (error) {
        console.error("Error loading favicon from admin settings:", error);
      }
    };

    const updateFavicon = (url: string) => {
      if (!url) return;

      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach((link) => link.remove());

      // Add cache busting to force reload
      const timestamp = Date.now();
      const faviconUrl = url.includes("?")
        ? `${url}&t=${timestamp}`
        : `${url}?t=${timestamp}`;

      // Create main favicon
      const favicon = document.createElement("link");
      favicon.setAttribute("rel", "icon");
      favicon.setAttribute("type", "image/x-icon");
      favicon.setAttribute("href", faviconUrl);
      document.head.appendChild(favicon);

      // Create shortcut icon (for older browsers)
      const shortcutIcon = document.createElement("link");
      shortcutIcon.setAttribute("rel", "shortcut icon");
      shortcutIcon.setAttribute("type", "image/x-icon");
      shortcutIcon.setAttribute("href", faviconUrl);
      document.head.appendChild(shortcutIcon);

      // Create apple-touch-icon
      const appleIcon = document.createElement("link");
      appleIcon.setAttribute("rel", "apple-touch-icon");
      appleIcon.setAttribute("href", faviconUrl);
      document.head.appendChild(appleIcon);

      // Force browser to reload favicon by temporarily changing href
      const tempLink = document.createElement("link");
      tempLink.setAttribute("rel", "icon");
      tempLink.setAttribute("href", faviconUrl);
      tempLink.setAttribute("type", "image/x-icon");
      document.head.appendChild(tempLink);

      // Remove the temporary link after a short delay
      setTimeout(() => {
        try {
          if (tempLink && tempLink.parentNode) {
            tempLink.parentNode.removeChild(tempLink);
          }
        } catch (error) {
          // Element might already be removed, ignore error
          console.debug("Temporary favicon link already removed");
        }
      }, 100);

      console.log("Favicon updated to:", faviconUrl);
    };

    // Load favicon on mount
    loadFavicon();

    // Listen for storage changes to update favicon in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "admin-settings") {
        loadFavicon();
      }
    };

    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      loadFavicon();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "admin-settings-changed",
      handleCustomStorageChange,
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "admin-settings-changed",
        handleCustomStorageChange,
      );
    };
  }, [faviconUrl]);

  return null; // This component doesn't render anything visible
}
