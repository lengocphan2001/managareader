"use client";

import { useEffect, useState } from "react";

interface ScriptInjectorProps {
  type: "header" | "footer";
}

export default function ScriptInjector({ type }: ScriptInjectorProps) {
  const [scripts, setScripts] = useState<string>("");

  useEffect(() => {
    // Load scripts from localStorage (admin settings)
    const loadScripts = () => {
      try {
        const savedSettings = localStorage.getItem("admin-settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          const scriptContent =
            type === "header" ? parsed.headerScripts : parsed.footerScripts;
          setScripts(scriptContent || "");
        }
      } catch (error) {
        console.error("Error loading admin settings for scripts:", error);
      }
    };

    loadScripts();

    // Listen for changes to admin settings
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "admin-settings") {
        loadScripts();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [type]);

  useEffect(() => {
    if (!scripts || scripts.trim() === "") {
      return;
    }

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = scripts;

    // Find all script tags
    const scriptTags = tempDiv.querySelectorAll("script");

    scriptTags.forEach((scriptTag) => {
      // Create a new script element
      const newScript = document.createElement("script");

      // Copy attributes
      Array.from(scriptTag.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // Copy content
      if (scriptTag.src) {
        newScript.src = scriptTag.src;
      } else {
        newScript.textContent = scriptTag.textContent;
      }

      // Inject the script
      if (type === "header") {
        document.head.appendChild(newScript);
      } else {
        document.body.appendChild(newScript);
      }
    });

    // Handle inline scripts that aren't in script tags
    const inlineScripts = scripts
      .split(/<script[^>]*>([\s\S]*?)<\/script>/gi)
      .filter((_, index) => index % 2 === 1); // Get only the content between script tags

    inlineScripts.forEach((scriptContent) => {
      if (scriptContent.trim()) {
        const newScript = document.createElement("script");
        newScript.textContent = scriptContent;

        if (type === "header") {
          document.head.appendChild(newScript);
        } else {
          document.body.appendChild(newScript);
        }
      }
    });

    // Cleanup function
    return () => {
      // Note: We can't easily remove dynamically added scripts
      // This is a limitation of the approach, but scripts are typically
      // added once and don't need to be removed
    };
  }, [scripts, type]);

  // This component doesn't render anything
  return null;
}
