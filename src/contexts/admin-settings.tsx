"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  timezone: string;
  language: string;
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  enableDarkMode: boolean;
  metaKeywords: string;
  metaAuthor: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
}

interface AdminSettingsContextValue {
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  updateSetting: (key: keyof AdminSettings, value: any) => void;
  resetSettings: () => void;
  loading: boolean;
  uploadFile: (file: File, type: 'logo' | 'favicon') => Promise<string>;
  applyToWebsite: () => Promise<boolean>;
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
  enableDarkMode: true,
  metaKeywords: "manga, anime, comics, reading, online",
  metaAuthor: "MangaReader Team",
  googleAnalyticsId: "",
  facebookPixelId: "",
};

const AdminSettingsContext = createContext<AdminSettingsContextValue | undefined>(undefined);

export function AdminSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load settings from localStorage or API
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('admin-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch (error) {
        console.error('Error loading admin settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = (newSettings: Partial<AdminSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    // Save to localStorage
    try {
      localStorage.setItem('admin-settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving admin settings:', error);
    }
  };

  const updateSetting = (key: keyof AdminSettings, value: any) => {
    updateSettings({ [key]: value });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem('admin-settings');
    } catch (error) {
      console.error('Error resetting admin settings:', error);
    }
  };

  // Upload file and return the new URL
  const uploadFile = async (file: File, type: 'logo' | 'favicon'): Promise<string> => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Upload to backend API
      const response = await fetch('/api/admin/upload-asset', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Update the setting with the new URL
      const newUrl = result.url;
      updateSetting(type === 'logo' ? 'logoUrl' : 'faviconUrl', newUrl);
      
      return newUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Apply settings to the actual website (update env vars, meta tags, etc.)
  const applyToWebsite = async (): Promise<boolean> => {
    try {
      // Call backend API to apply settings
      const response = await fetch('/api/admin/apply-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to apply settings');
      }

      // Update meta tags on the current page
      updateMetaTags();
      
      // Update CSS variables
      updateCSSVariables();
      
      return true;
    } catch (error) {
      console.error('Error applying settings:', error);
      return false;
    }
  };

  // Update meta tags on the current page
  const updateMetaTags = () => {
    // Update title
    document.title = settings.siteName;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', settings.siteDescription);
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', settings.metaKeywords);
    
    // Update meta author
    let metaAuthor = document.querySelector('meta[name="author"]');
    if (!metaAuthor) {
      metaAuthor = document.createElement('meta');
      metaAuthor.setAttribute('name', 'author');
      document.head.appendChild(metaAuthor);
    }
    metaAuthor.setAttribute('content', settings.metaAuthor);
    
    // Update favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      favicon.setAttribute('type', 'image/x-icon');
      document.head.appendChild(favicon);
    }
    favicon.setAttribute('href', settings.faviconUrl);
    
    // Update logo in Open Graph tags
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', settings.logoUrl);
    
    // Update site name in Open Graph
    let ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (!ogSiteName) {
      ogSiteName = document.createElement('meta');
      ogSiteName.setAttribute('property', 'og:site_name');
      document.head.appendChild(ogSiteName);
    }
    ogSiteName.setAttribute('content', settings.siteName);
  };

  // Update CSS variables for primary color
  const updateCSSVariables = () => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--primary-color-hover', adjustColor(settings.primaryColor, -20));
    root.style.setProperty('--primary-color-light', adjustColor(settings.primaryColor, 20));
  };

  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  return (
    <AdminSettingsContext.Provider value={{
      settings,
      updateSettings,
      updateSetting,
      resetSettings,
      loading,
      uploadFile,
      applyToWebsite,
    }}>
      {children}
    </AdminSettingsContext.Provider>
  );
}

export function useAdminSettings() {
  const context = useContext(AdminSettingsContext);
  if (!context) {
    throw new Error('useAdminSettings must be used within AdminSettingsProvider');
  }
  return context;
}
