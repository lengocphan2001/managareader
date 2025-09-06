"use client";

import { useState } from "react";
import { SiteSettings } from "@/components/admin/SiteSettings";
import { WebsiteOverview } from "@/components/admin/WebsiteOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { Settings, Eye } from "lucide-react";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-600">Manage your website configuration and appearance</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WebsiteOverview />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SiteSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
