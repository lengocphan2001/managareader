"use client";

import { useEffect, useState } from "react";

interface ScriptInjectorProps {
  type: "header" | "footer";
}

export default function ScriptInjector({ type }: ScriptInjectorProps) {
  const [scripts, setScripts] = useState<string>("");
  
  useEffect(() => {
    // Load scripts from API
    const loadScripts = async () => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/admin/get-settings`);

        if (response.ok) {
          const data = await response.json();
          const scriptContent =
            type === "header" ? data.headerScripts : data.footerScripts;

          setScripts(scriptContent || "");
        } else {
          console.log(`Failed to load ${type} scripts from API`);
        }
      } catch (error) {
        console.error("Error loading admin settings from API:", error);
      }
    };

    loadScripts();
  }, [type]);

  useEffect(() => {
    if (!scripts || scripts.trim() === "") {
      console.log(`No ${type} scripts to inject`);
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
        // For footer scripts, append to the very end of body
        document.body.appendChild(newScript);
      }
    });

    // Find all noscript tags
    const noscriptTags = tempDiv.querySelectorAll("noscript");

    noscriptTags.forEach((noscriptTag) => {
      // Create a new noscript element
      const newNoscript = document.createElement("noscript");

      // Copy innerHTML (noscript content)
      newNoscript.innerHTML = noscriptTag.innerHTML;

      // Inject the noscript
      if (type === "header") {
        document.head.appendChild(newNoscript);
      } else {
        // For footer noscript, append to the very end of body
        document.body.appendChild(newNoscript);
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
          // For footer inline scripts, append to the very end of body
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

  return null;
}
