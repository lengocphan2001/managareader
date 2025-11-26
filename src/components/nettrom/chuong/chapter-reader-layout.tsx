"use client";

import { useState, useEffect } from "react";
import { useChapterContext } from "@/contexts/chapter";
import ChapterPages from "./chapter-pages";
import ChapterControlPanel from "./chapter-control-panel";
import Iconify from "@/components/iconify";
import { Utils } from "@/utils";

export default function ChapterReaderLayout() {
  const { manga, chapter, chapterId } = useChapterContext();
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

  // Auto-close menu when chapter changes
  useEffect(() => {
    setIsControlPanelOpen(false);
  }, [chapterId]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900">
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
          className="fixed right-4 top-24 z-[100] flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800 text-white shadow-lg transition-colors hover:bg-neutral-700 lg:top-28"
          aria-label="Open control panel"
          style={{ zIndex: 1000 }}
        >
          <Iconify icon="fa:bars" className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
