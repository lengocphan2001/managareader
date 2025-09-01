"use client";

import { useState, useRef } from "react";
import {
  Save,
  RefreshCw,
  Globe,
  Palette,
  Shield,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Switch } from "@/components/shadcn/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";
import { useAdminSettings } from "@/contexts/admin-settings";

export function SiteSettings() {
  const {
    settings,
    updateSettings,
    updateSetting,
    resetSettings,
    loading,
    uploadFile,
    applyToWebsite,
  } = useAdminSettings();

  const [saved, setSaved] = useState(false);
  const [applying, setApplying] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [error, setError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setError(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    resetSettings();
    setError(null);
  };

  const handleApplyToWebsite = async () => {
    try {
      setApplying(true);
      setError(null);

      const success = await applyToWebsite();

      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 5000);
      } else {
        setError("Failed to apply settings to website");
      }
    } catch (err) {
      setError("Error applying settings to website");
    } finally {
      setApplying(false);
    }
  };

  const handleFileUpload = async (file: File, type: "logo" | "favicon") => {
    try {
      setUploading(type);
      setError(null);
      setUploadProgress({ [type]: 0 });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => ({
          ...prev,
          [type]: Math.min(prev[type] + 10, 90),
        }));
      }, 100);

      const newUrl = await uploadFile(file, type);

      clearInterval(progressInterval);
      setUploadProgress({ [type]: 100 });

      setTimeout(() => {
        setUploading(null);
        setUploadProgress({});
      }, 1000);
    } catch (err) {
      setError(`Failed to upload ${type}`);
      setUploading(null);
      setUploadProgress({});
    }
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon",
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  };

  const triggerFileInput = (type: "logo" | "favicon") => {
    if (type === "logo") {
      logoInputRef.current?.click();
    } else {
      faviconInputRef.current?.click();
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-600">
            Configure your site's appearance, security, and performance
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button
            onClick={handleApplyToWebsite}
            disabled={applying}
            className="bg-green-600 hover:bg-green-700"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {applying ? "Applying..." : "Apply to Website"}
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center">
            <CheckCircle className="mr-3 h-5 w-5 text-green-400" />
            <span className="text-sm text-green-800">
              {applying
                ? "Settings applied to website successfully!"
                : "Settings saved successfully!"}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <AlertCircle className="mr-3 h-5 w-5 text-red-400" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="flex items-center space-x-2"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Site Name *
                  </label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => updateSetting("siteName", e.target.value)}
                    placeholder="Enter site name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Site URL
                  </label>
                  <Input
                    value={settings.siteUrl}
                    onChange={(e) => updateSetting("siteUrl", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Site Description *
                  </label>
                  <Input
                    value={settings.siteDescription}
                    onChange={(e) =>
                      updateSetting("siteDescription", e.target.value)
                    }
                    placeholder="Enter site description"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Admin Email
                  </label>
                  <Input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) =>
                      updateSetting("adminEmail", e.target.value)
                    }
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting("timezone", e.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {settings.logoUrl && (
                      <img
                        src={settings.logoUrl}
                        alt="Current logo"
                        className="h-16 w-16 rounded-lg border object-contain"
                      />
                    )}
                    <div className="flex-1">
                      <Input
                        value={settings.logoUrl}
                        onChange={(e) =>
                          updateSetting("logoUrl", e.target.value)
                        }
                        placeholder="/logo.png"
                        className="mb-2"
                      />
                      <Button
                        onClick={() => triggerFileInput("logo")}
                        disabled={uploading === "logo"}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading === "logo"
                          ? `Uploading... ${uploadProgress.logo || 0}%`
                          : "Upload New Logo"}
                      </Button>
                    </div>
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={(e) => handleFileSelect(e, "logo")}
                    className="hidden"
                  />
                </div>

                {/* Favicon Upload */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Favicon
                  </label>
                  <div className="flex items-center space-x-4">
                    {settings.faviconUrl && (
                      <img
                        src={settings.faviconUrl}
                        alt="Current favicon"
                        className="h-8 w-8 rounded border object-contain"
                      />
                    )}
                    <div className="flex-1">
                      <Input
                        value={settings.faviconUrl}
                        onChange={(e) =>
                          updateSetting("faviconUrl", e.target.value)
                        }
                        placeholder="/favicon.ico"
                        className="mb-2"
                      />
                      <Button
                        onClick={() => triggerFileInput("favicon")}
                        disabled={uploading === "favicon"}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading === "favicon"
                          ? `Uploading... ${uploadProgress.favicon || 0}%`
                          : "Upload New Favicon"}
                      </Button>
                    </div>
                  </div>
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/x-icon,image/png,image/svg+xml"
                    onChange={(e) => handleFileSelect(e, "favicon")}
                    className="hidden"
                  />
                </div>

                {/* Primary Color */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) =>
                        updateSetting("primaryColor", e.target.value)
                      }
                      placeholder="#3B82F6"
                    />
                    <div
                      className="h-10 w-10 rounded border"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Enable Dark Mode
                  </label>
                  <Switch
                    checked={settings.enableDarkMode}
                    onCheckedChange={(checked) =>
                      updateSetting("enableDarkMode", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Meta Keywords
                  </label>
                  <Input
                    value={settings.metaKeywords}
                    onChange={(e) =>
                      updateSetting("metaKeywords", e.target.value)
                    }
                    placeholder="manga, anime, comics, reading, online"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Meta Author
                  </label>
                  <Input
                    value={settings.metaAuthor}
                    onChange={(e) =>
                      updateSetting("metaAuthor", e.target.value)
                    }
                    placeholder="MangaReader Team"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Settings */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Analytics Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Google Analytics ID
                  </label>
                  <Input
                    value={settings.googleAnalyticsId}
                    onChange={(e) =>
                      updateSetting("googleAnalyticsId", e.target.value)
                    }
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Facebook Pixel ID
                  </label>
                  <Input
                    value={settings.facebookPixelId}
                    onChange={(e) =>
                      updateSetting("facebookPixelId", e.target.value)
                    }
                    placeholder="XXXXXXXXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Enable User Registration
                    </label>
                    <p className="text-xs text-gray-500">
                      Allow new users to create accounts
                    </p>
                  </div>
                  <Switch checked={true} disabled className="opacity-50" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Require Email Verification
                    </label>
                    <p className="text-xs text-gray-500">
                      Users must verify their email before accessing the site
                    </p>
                  </div>
                  <Switch checked={true} disabled className="opacity-50" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Enable Two-Factor Authentication
                    </label>
                    <p className="text-xs text-gray-500">
                      Add an extra layer of security to user accounts
                    </p>
                  </div>
                  <Switch checked={false} disabled className="opacity-50" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Max Login Attempts
                  </label>
                  <Input
                    type="number"
                    value={5}
                    disabled
                    className="opacity-50"
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Session Timeout (hours)
                  </label>
                  <Input
                    type="number"
                    value={24}
                    disabled
                    className="opacity-50"
                    min="1"
                    max="168"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
