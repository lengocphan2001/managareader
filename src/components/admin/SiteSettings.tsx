"use client";

import { useState, useRef } from "react";
import {
  Save,
  RefreshCw,
  Globe,
  Palette,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Code,
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
import { Textarea } from "@/components/shadcn/textarea";
import { useAdminSettings } from "@/contexts/admin-settings";
import { DragDropUpload } from "./DragDropUpload";

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

  const handleFileUpload = async (
    file: File,
    type: "logo" | "favicon" | "footerLogo",
  ) => {
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
    type: "logo" | "favicon" | "footerLogo",
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
        <TabsList className="grid w-full grid-cols-3">
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
          <TabsTrigger value="scripts" className="flex items-center space-x-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Scripts</span>
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
                  <p className="mb-3 text-xs text-gray-500">
                    Upload a logo for your site. You can also enter a URL
                    directly.
                  </p>

                  <div className="space-y-4">
                    <Input
                      value={settings.logoUrl}
                      onChange={(e) => updateSetting("logoUrl", e.target.value)}
                      placeholder="/logo.png or https://example.com/logo.png"
                      className="text-sm"
                    />

                    <DragDropUpload
                      onFileSelect={(file) => handleFileUpload(file, "logo")}
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      maxSize={5 * 1024 * 1024} // 5MB
                      disabled={uploading === "logo"}
                      currentFile={settings.logoUrl}
                      onRemove={() => updateSetting("logoUrl", "")}
                      type="logo"
                    />

                    {uploading === "logo" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Uploading logo...</span>
                          <span>{uploadProgress.logo || 0}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${uploadProgress.logo || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Footer Logo
                  </label>
                  <p className="mb-3 text-xs text-gray-500">
                    Upload a footer logo for your site. You can also enter a URL
                    directly.
                  </p>

                  <div className="space-y-4">
                    <Input
                      value={settings.footerLogoUrl}
                      onChange={(e) =>
                        updateSetting("footerLogoUrl", e.target.value)
                      }
                      placeholder="/images/logo-footer.png or https://example.com/footer-logo.png"
                      className="text-sm"
                    />

                    <DragDropUpload
                      onFileSelect={(file) =>
                        handleFileUpload(file, "footerLogo")
                      }
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      maxSize={5 * 1024 * 1024} // 5MB
                      disabled={uploading === "footerLogo"}
                      currentFile={settings.footerLogoUrl}
                      onRemove={() => updateSetting("footerLogoUrl", "")}
                      type="logo"
                    />

                    {uploading === "footerLogo" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Uploading footer logo...</span>
                          <span>{uploadProgress.footerLogo || 0}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                            style={{
                              width: `${uploadProgress.footerLogo || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
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

        {/* Scripts Settings */}
        <TabsContent value="scripts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5" />
                Custom Scripts
              </CardTitle>
              <p className="text-sm text-gray-600">
                Add custom JavaScript code to be injected into the client panel
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header Scripts */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Header Scripts
                </label>
                <p className="mb-3 text-xs text-gray-500">
                  Scripts that will be injected into the &lt;head&gt; section of
                  all client pages. Perfect for analytics, tracking, or external
                  libraries.
                </p>
                <Textarea
                  value={settings.headerScripts}
                  onChange={(e) =>
                    updateSetting("headerScripts", e.target.value)
                  }
                  placeholder={`<!-- Example: Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>`}
                  className="min-h-[200px] font-mono text-sm"
                  rows={10}
                />
              </div>

              {/* Footer Scripts */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Footer Scripts
                </label>
                <p className="mb-3 text-xs text-gray-500">
                  Scripts that will be injected before the closing &lt;/body&gt;
                  tag. Perfect for performance tracking, chat widgets, or custom
                  functionality.
                </p>
                <Textarea
                  value={settings.footerScripts}
                  onChange={(e) =>
                    updateSetting("footerScripts", e.target.value)
                  }
                  placeholder={`<!-- Example: Chat Widget -->
<script>
  // Your custom JavaScript code here
  console.log('Footer script loaded');
</script>`}
                  className="min-h-[200px] font-mono text-sm"
                  rows={10}
                />
              </div>

              {/* Warning */}
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start">
                  <AlertCircle className="mr-3 mt-0.5 h-5 w-5 text-yellow-400" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">
                      Important Security Notice
                    </h4>
                    <p className="mt-1 text-sm text-yellow-700">
                      Only add scripts from trusted sources. Malicious scripts
                      can compromise your site's security and user data. Always
                      review and test scripts before applying them to
                      production.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
