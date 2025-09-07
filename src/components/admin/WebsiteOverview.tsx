"use client";

import { useAdminSettings } from "@/contexts/admin-settings";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import {
  Globe,
  Palette,
  FileText,
  BarChart3,
  Code,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export function WebsiteOverview() {
  const { settings } = useAdminSettings();

  const getStatusIcon = (value: string, required: boolean = false) => {
    if (required && !value) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (value) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (value: string, required: boolean = false) => {
    if (required && !value) {
      return <Badge variant="destructive">Required</Badge>;
    }
    if (value) {
      return <Badge variant="default">Configured</Badge>;
    }
    return <Badge variant="secondary">Optional</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Website Overview</h2>
        <Badge variant="outline" className="text-sm">
          {settings.siteName || "Unnamed Site"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Globe className="mr-2 h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Site Name</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(settings.siteName, true)}
                {getStatusBadge(settings.siteName, true)}
              </div>
            </div>
            <div className="truncate text-xs text-gray-500">
              {settings.siteName || "Not set"}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Description</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(settings.siteDescription, true)}
                {getStatusBadge(settings.siteDescription, true)}
              </div>
            </div>
            <div className="truncate text-xs text-gray-500">
              {settings.siteDescription || "Not set"}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Site URL</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(settings.siteUrl)}
                {getStatusBadge(settings.siteUrl)}
              </div>
            </div>
            <div className="truncate text-xs text-gray-500">
              {settings.siteUrl || "Not set"}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Admin Email</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(settings.adminEmail)}
                {getStatusBadge(settings.adminEmail)}
              </div>
            </div>
            <div className="truncate text-xs text-gray-500">
              {settings.adminEmail || "Not set"}
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Palette className="mr-2 h-5 w-5" />
              Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Main Logo</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(settings.logoUrl)}
                {getStatusBadge(settings.logoUrl)}
              </div>
            </div>
            {settings.logoUrl && (
              <div className="flex items-center space-x-2">
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-8 w-8 rounded border object-contain"
                />
                <span className="truncate text-xs text-gray-500">
                  {settings.logoUrl}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Footer Logo</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(settings.footerLogoUrl)}
                {getStatusBadge(settings.footerLogoUrl)}
              </div>
            </div>
            {settings.footerLogoUrl && (
              <div className="flex items-center space-x-2">
                <img
                  src={settings.footerLogoUrl}
                  alt="Footer Logo"
                  className="h-6 w-6 rounded border object-contain"
                />
                <span className="truncate text-xs text-gray-500">
                  {settings.footerLogoUrl}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO & Analytics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="mr-2 h-5 w-5" />
              SEO & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Meta Keywords</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(settings.metaKeywords)}
                {getStatusBadge(settings.metaKeywords)}
              </div>
            </div>
            <div className="truncate text-xs text-gray-500">
              {settings.metaKeywords || "Not set"}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Meta Author</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(settings.metaAuthor)}
                {getStatusBadge(settings.metaAuthor)}
              </div>
            </div>
            <div className="truncate text-xs text-gray-500">
              {settings.metaAuthor || "Not set"}
            </div>
          </CardContent>
        </Card>

        {/* Custom Scripts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Code className="mr-2 h-5 w-5" />
              Custom Scripts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Header Scripts</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(settings.headerScripts)}
                {getStatusBadge(settings.headerScripts)}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {settings.headerScripts
                ? `${settings.headerScripts.length} characters`
                : "No scripts"}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Footer Scripts</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(settings.footerScripts)}
                {getStatusBadge(settings.footerScripts)}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {settings.footerScripts
                ? `${settings.footerScripts.length} characters`
                : "No scripts"}
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Timezone</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(settings.timezone)}
                {getStatusBadge(settings.timezone)}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {settings.timezone || "UTC"}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Language</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(settings.language)}
                {getStatusBadge(settings.language)}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {settings.language || "en"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
