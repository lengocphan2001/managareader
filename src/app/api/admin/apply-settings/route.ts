import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

    // Create or update environment variables file
    await updateEnvironmentFile(settings);

    // Create or update CSS variables file
    await updateCSSVariablesFile(settings);

    // Create or update meta tags configuration
    await updateMetaTagsConfig(settings);

    return NextResponse.json({
      success: true,
      message: "Settings applied successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error applying settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function updateEnvironmentFile(settings: any) {
  try {
    const envPath = join(process.cwd(), ".env.local");
    let envContent = "";

    // Read existing .env.local if it exists
    if (existsSync(envPath)) {
      envContent = await readFile(envPath, "utf-8");
    }

    // Update or add new environment variables
    const envUpdates = {
      NEXT_PUBLIC_SITE_NAME: settings.siteName,
      NEXT_PUBLIC_SITE_DESCRIPTION: settings.siteDescription,
      NEXT_PUBLIC_SITE_URL: settings.siteUrl,
      NEXT_PUBLIC_ADMIN_EMAIL: settings.adminEmail,
      NEXT_PUBLIC_PRIMARY_COLOR: settings.primaryColor,
      NEXT_PUBLIC_LOGO_URL: settings.logoUrl,
      NEXT_PUBLIC_FAVICON_URL: settings.faviconUrl,
      NEXT_PUBLIC_FOOTER_LOGO_URL: settings.footerLogoUrl,
      NEXT_PUBLIC_META_KEYWORDS: settings.metaKeywords,
      NEXT_PUBLIC_META_AUTHOR: settings.metaAuthor,
      NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: settings.googleAnalyticsId,
      NEXT_PUBLIC_FACEBOOK_PIXEL_ID: settings.facebookPixelId,
    };

    // Update existing variables or add new ones
    Object.entries(envUpdates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*`, "m");
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    });

    // Write updated content
    await writeFile(envPath, envContent.trim() + "\n");
  } catch (error) {
    console.error("Error updating environment file:", error);
  }
}

async function updateCSSVariablesFile(settings: any) {
  try {
    const cssPath = join(process.cwd(), "src", "styles", "admin-variables.css");
    const cssContent = `/* Auto-generated CSS variables from admin settings */
:root {
  --primary-color: ${settings.primaryColor};
  --primary-color-hover: ${adjustColor(settings.primaryColor, -20)};
  --primary-color-light: ${adjustColor(settings.primaryColor, 20)};
  --site-name: "${settings.siteName}";
  --site-description: "${settings.siteDescription}";
}

/* Primary color utility classes */
.bg-primary { background-color: var(--primary-color); }
.text-primary { color: var(--primary-color); }
.border-primary { border-color: var(--primary-color); }
.hover\\:bg-primary:hover { background-color: var(--primary-color-hover); }
.hover\\:text-primary:hover { color: var(--primary-color-hover); }
`;

    await writeFile(cssPath, cssContent);
  } catch (error) {
    console.error("Error updating CSS variables file:", error);
  }
}

async function updateMetaTagsConfig(settings: any) {
  try {
    const configPath = join(process.cwd(), "src", "config", "site-meta.json");
    const metaConfig = {
      title: settings.siteName,
      description: settings.siteDescription,
      keywords: settings.metaKeywords,
      author: settings.metaAuthor,
      url: settings.siteUrl,
      logo: settings.logoUrl,
      favicon: settings.faviconUrl,
      primaryColor: settings.primaryColor,
      googleAnalyticsId: settings.googleAnalyticsId,
      facebookPixelId: settings.facebookPixelId,
      lastUpdated: new Date().toISOString(),
    };

    // Ensure config directory exists
    const configDir = join(process.cwd(), "src", "config");
    if (!existsSync(configDir)) {
      await writeFile(configDir, "");
    }

    await writeFile(configPath, JSON.stringify(metaConfig, null, 2));
  } catch (error) {
    console.error("Error updating meta tags config:", error);
  }
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
