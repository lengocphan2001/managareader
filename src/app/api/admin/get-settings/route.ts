import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET() {
  try {
    // Try to load settings from the config file
    const configPath = join(process.cwd(), "src", "config", "site-meta.json");

    if (existsSync(configPath)) {
      const configContent = await readFile(configPath, "utf-8");
      const settings = JSON.parse(configContent);

      return NextResponse.json({
        success: true,
        settings: settings,
      });
    }

    // Fallback to default settings if no config file exists
    const defaultSettings = {
      siteName: "MangaReader",
      siteDescription: "Your ultimate manga reading experience",
      siteUrl: "https://mangareader.com",
      adminEmail: "admin@mangareader.com",
      primaryColor: "#3B82F6",
      logoUrl: "/logo.png",
      faviconUrl: "/favicon.ico",
      footerLogoUrl: "/images/logo-footer.png",
      metaKeywords: "manga, anime, comics, reading, online",
      metaAuthor: "MangaReader Team",
      googleAnalyticsId: "",
      facebookPixelId: "",
    };

    return NextResponse.json({
      success: true,
      settings: defaultSettings,
    });
  } catch (error) {
    console.error("Error loading settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
