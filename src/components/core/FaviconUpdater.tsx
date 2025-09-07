"use client";

import { useLayoutEffect, useRef } from "react";

export default function FaviconUpdater() {
  const faviconElementsRef = useRef<HTMLLinkElement[]>([]);

  useLayoutEffect(() => {
    const loadFavicon = () => {
      try {
        if (typeof window !== "undefined") {
          const savedSettings = localStorage.getItem("admin-settings");
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            const newFaviconUrl = parsed.faviconUrl || "";
            updateFavicon(newFaviconUrl);
          }
        }
      } catch (error) {
        console.error("Error loading favicon from admin settings:", error);
      }
    };

    const updateFavicon = (url: string) => {
      if (!url) return;

      // Clean up previous favicon elements
      faviconElementsRef.current.forEach((element) => {
        try {
          if (element && element.parentNode) {
            element.parentNode.removeChild(element);
          }
        } catch (error) {
          // Element might already be removed, ignore error
        }
      });
      faviconElementsRef.current = [];

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
      faviconElementsRef.current.push(favicon);

      // Create shortcut icon (for older browsers)
      const shortcutIcon = document.createElement("link");
      shortcutIcon.setAttribute("rel", "shortcut icon");
      shortcutIcon.setAttribute("type", "image/x-icon");
      shortcutIcon.setAttribute("href", faviconUrl);
      document.head.appendChild(shortcutIcon);
      faviconElementsRef.current.push(shortcutIcon);

      // Create apple-touch-icon
      const appleIcon = document.createElement("link");
      appleIcon.setAttribute("rel", "apple-touch-icon");
      appleIcon.setAttribute("href", faviconUrl);
      document.head.appendChild(appleIcon);
      faviconElementsRef.current.push(appleIcon);

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

    // Cleanup function
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "admin-settings-changed",
        handleCustomStorageChange,
      );
      
      // Clean up favicon elements
      faviconElementsRef.current.forEach((element) => {
        try {
          if (element && element.parentNode) {
            element.parentNode.removeChild(element);
          }
        } catch (error) {
          // Element might already be removed, ignore error
        }
      });
      faviconElementsRef.current = [];
    };
  }, []);

  return null; // This component doesn't render anything visible
}
