// Utility to load and apply admin settings to the main website

export interface WebsiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  metaKeywords: string;
  metaAuthor: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
}

export async function loadWebsiteSettings(): Promise<WebsiteSettings | null> {
  try {
    // Load from API
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/admin/get-settings`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }

    return null;
  } catch (error) {
    console.error("Error loading website settings:", error);
    return null;
  }
}

export function applySettingsToWebsite(settings: WebsiteSettings) {
  if (typeof window === "undefined") return;

  // Update document title
  document.title = settings.siteName;

  // Update meta tags
  updateMetaTag("description", settings.siteDescription);
  updateMetaTag("keywords", settings.metaKeywords);
  updateMetaTag("author", settings.metaAuthor);

  // Update favicon
  updateFavicon(settings.faviconUrl);

  // Update Open Graph tags
  updateMetaTag("og:title", settings.siteName);
  updateMetaTag("og:description", settings.siteDescription);
  updateMetaTag("og:image", settings.logoUrl);
  updateMetaTag("og:site_name", settings.siteName);

  // Update CSS variables
  updateCSSVariables(settings.primaryColor);

  // Update Google Analytics
  if (settings.googleAnalyticsId) {
    updateGoogleAnalytics(settings.googleAnalyticsId);
  }

  // Update Facebook Pixel
  if (settings.facebookPixelId) {
    updateFacebookPixel(settings.facebookPixelId);
  }
}

function updateMetaTag(name: string, content: string) {
  let meta =
    document.querySelector(`meta[name="${name}"]`) ||
    document.querySelector(`meta[property="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    if (name.startsWith("og:")) {
      meta.setAttribute("property", name);
    } else {
      meta.setAttribute("name", name);
    }
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

function updateFavicon(href: string) {
  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.setAttribute("rel", "icon");
    favicon.setAttribute("type", "image/x-icon");
    document.head.appendChild(favicon);
  }
  favicon.setAttribute("href", href);
}

function updateCSSVariables(primaryColor: string) {
  const root = document.documentElement;
  root.style.setProperty("--primary-color", primaryColor);
  root.style.setProperty(
    "--primary-color-hover",
    adjustColor(primaryColor, -20),
  );
  root.style.setProperty(
    "--primary-color-light",
    adjustColor(primaryColor, 20),
  );
}

function updateGoogleAnalytics(gaId: string) {
  // Remove existing GA script
  const existingScript = document.querySelector(
    'script[src*="googletagmanager"]',
  );
  if (existingScript) {
    existingScript.remove();
  }

  // Add new GA script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  // Initialize GA
  const dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer = dataLayer;

  function gtag(...args: any[]) {
    dataLayer.push(args);
  }
  (window as any).gtag = gtag;

  gtag("js", new Date());
  gtag("config", gaId);
}

function updateFacebookPixel(pixelId: string) {
  // Remove existing FB Pixel script
  const existingScript = document.querySelector('script[src*="fbevents.js"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new FB Pixel script
  const script = document.createElement("script");
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Auto-load settings when the script runs
if (typeof window !== "undefined") {
  loadWebsiteSettings().then((settings) => {
    if (settings) {
      applySettingsToWebsite(settings);
    }
  });
}
