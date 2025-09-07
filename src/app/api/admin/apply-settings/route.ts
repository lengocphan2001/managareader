import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();

    // Validate required fields
    if (!settings.siteName || !settings.siteDescription) {
      return NextResponse.json(
        { error: "Site name and description are required" },
        { status: 400 },
      );
    }

    // Create environment updates
    const envUpdates = {
      NEXT_PUBLIC_SITE_NAME: settings.siteName,
      NEXT_PUBLIC_SITE_DESCRIPTION: settings.siteDescription,
      NEXT_PUBLIC_SITE_URL: settings.siteUrl || "https://mangareader.com",
      NEXT_PUBLIC_ADMIN_EMAIL: settings.adminEmail || "admin@mangareader.com",
      NEXT_PUBLIC_TIMEZONE: settings.timezone || "UTC",
      NEXT_PUBLIC_LANGUAGE: settings.language || "en",
      NEXT_PUBLIC_PRIMARY_COLOR: settings.primaryColor || "#3B82F6",
      NEXT_PUBLIC_LOGO_URL: settings.logoUrl || "/logo.png",
      NEXT_PUBLIC_FOOTER_LOGO_URL:
        settings.footerLogoUrl || "/images/logo-footer.png",
      NEXT_PUBLIC_ENABLE_DARK_MODE: settings.enableDarkMode ? "true" : "false",
      NEXT_PUBLIC_HEADER_SCRIPTS: settings.headerScripts || "",
      NEXT_PUBLIC_FOOTER_SCRIPTS: settings.footerScripts || "",
    };

    // Write to .env.local file
    const envPath = join(process.cwd(), ".env.local");
    const envContent = Object.entries(envUpdates)
      .map(([key, value]) => `${key}="${value}"`)
      .join("\n");

    try {
      await writeFile(envPath, envContent);
    } catch (error) {
      console.error("Error writing .env.local:", error);
      // Continue even if we can't write to .env.local
    }

    // Store settings in localStorage format for client-side access
    const clientSettings = {
      adminSiteName: settings.siteName,
      adminSiteDescription: settings.siteDescription,
      adminSiteUrl: settings.siteUrl,
      adminEmail: settings.adminEmail,
      adminTimezone: settings.timezone,
      adminLanguage: settings.language,
      adminPrimaryColor: settings.primaryColor,
      adminLogoUrl: settings.logoUrl,
      adminFooterLogoUrl: settings.footerLogoUrl,
      adminEnableDarkMode: settings.enableDarkMode,
      adminHeaderScripts: settings.headerScripts,
      adminFooterScripts: settings.footerScripts,
    };

    return NextResponse.json({
      success: true,
      message: "Settings applied successfully",
      settings: clientSettings,
      envUpdates,
    });
  } catch (error) {
    console.error("Apply settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
