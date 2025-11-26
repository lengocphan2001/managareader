import useSWR from "swr";

interface AdminSettings {
  siteName?: string;
  siteDescription?: string;
  siteUrl?: string;
  adminEmail?: string;
  timezone?: string;
  language?: string;
  primaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  footerLogoUrl?: string;
  enableDarkMode?: boolean;
  headerScripts?: string;
  footerScripts?: string;
  metaKeywords?: string;
  metaAuthor?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
}

const defaultSettings: AdminSettings = {
  siteName: "MangaReader",
  siteDescription: "Your ultimate manga reading experience",
  siteUrl: "https://mangareader.com",
  adminEmail: "admin@mangareader.com",
  timezone: "UTC",
  language: "en",
  primaryColor: "#3B82F6",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  footerLogoUrl: "/images/logo-footer.png",
  enableDarkMode: true,
  headerScripts: "",
  footerScripts: "",
};

const fetcher = async (url: string): Promise<AdminSettings> => {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const response = await fetch(`${backendUrl}${url}`);

  if (!response.ok) {
    throw new Error("Failed to fetch settings");
  }

  const data = await response.json();
  return { ...defaultSettings, ...data };
};

/**
 * Hook to fetch and cache admin settings globally
 * Uses SWR for caching and deduplication
 * All components using this hook will share the same cached data
 */
export function useAdminSettings() {
  const { data, error, isLoading, mutate } = useSWR<AdminSettings>(
    "/api/admin/get-settings",
    fetcher,
    {
      // Cache for 5 minutes
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
      // Use default settings if error
      fallbackData: defaultSettings,
      // Don't retry on error
      shouldRetryOnError: false,
    },
  );

  return {
    settings: data || defaultSettings,
    isLoading,
    error,
    mutate,
  };
}

