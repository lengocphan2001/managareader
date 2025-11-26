"use client";

import { useState, useEffect } from "react";
import { useChapterContext } from "@/contexts/chapter";
import { useSettingsContext } from "@/contexts/settings";
import ChapterPages from "./chapter-pages";
import ChapterControlPanel from "./chapter-control-panel";
import { FaTimes, FaExpand } from "react-icons/fa";
import Link from "next/link";
import { Constants } from "@/constants";
import { Utils } from "@/utils";

export default function ChapterReaderLayout() {
  const { manga, chapter } = useChapterContext();
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-close panel on mobile by default
      if (window.innerWidth < 1024) {
        setIsControlPanelOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const mangaTitle = Utils.Mangadex.getMangaTitle(manga);
  const chapterTitle = Utils.Mangadex.getChapterTitle(chapter);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Hide header when in chapter reader
  useEffect(() => {
    const header = document.getElementById("header");
    if (header) {
      header.style.display = "none";
    }
    return () => {
      if (header) {
        header.style.display = "";
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 flex h-screen w-screen overflow-hidden bg-neutral-900">
      {/* Manga Content - Left Side */}
      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isControlPanelOpen ? "lg:mr-96" : ""
        }`}
      >
        <ChapterPages />
      </div>

      {/* Control Panel - Right Side (Desktop) / Drawer (Mobile) */}
      <ChapterControlPanel
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
      />

      {/* Toggle Control Panel Button (when closed) */}
      {!isControlPanelOpen && (
        <button
          onClick={() => setIsControlPanelOpen(true)}
          className="fixed right-4 top-20 z-50 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800 text-white transition-colors hover:bg-neutral-700 shadow-lg lg:top-24"
          aria-label="Open control panel"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

