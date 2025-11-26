"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import AuthRequired from "../auth-required";
import LibraryList from "./library-list";
import { Constants } from "@/constants";
import { FaArrowLeft } from "react-icons/fa";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/shadcn/tabs";
import { useState } from "react";

export default function LibraryPageClient() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("reading");

  if (!user) {
    return <AuthRequired title="Library" />;
  }

  return (
    <div className="w-full">
      {/* Header with back arrow */}
      <div className="mb-6 p-5 sm:mb-8 md:mb-10">
        <Link
          href={Constants.Routes.nettrom.index}
          className="inline-flex items-center gap-3 text-4xl font-semibold text-white no-underline hover:no-underline sm:gap-4 sm:text-5xl md:text-6xl"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800 transition-colors hover:bg-neutral-700 sm:h-16 sm:w-16 md:h-20 md:w-20">
            <FaArrowLeft className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </div>
          <span>Library</span>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
        className="mb-6 w-full sm:mb-8 md:mb-10"
      >
        <div className="overflow-x-auto">
          <TabsList className="!h-auto gap-2 bg-transparent sm:gap-3">
            <TabsTrigger
              value="reading"
              className="shrink-0 whitespace-nowrap rounded px-6 py-3 text-2xl data-[state=active]:bg-gray-700 data-[state=inactive]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-white data-[state=inactive]:text-gray-400 sm:px-8 sm:py-4 sm:text-3xl"
            >
              Reading
            </TabsTrigger>
            <TabsTrigger
              value="plan_to_read"
              className="shrink-0 whitespace-nowrap rounded px-6 py-3 text-2xl data-[state=active]:bg-gray-700 data-[state=inactive]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-white data-[state=inactive]:text-gray-400 sm:px-8 sm:py-4 sm:text-3xl"
            >
              Plan To Read
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="shrink-0 whitespace-nowrap rounded px-6 py-3 text-2xl data-[state=active]:bg-gray-700 data-[state=inactive]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-white data-[state=inactive]:text-gray-400 sm:px-8 sm:py-4 sm:text-3xl"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="on_hold"
              className="shrink-0 whitespace-nowrap rounded px-6 py-3 text-2xl data-[state=active]:bg-gray-700 data-[state=inactive]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-white data-[state=inactive]:text-gray-400 sm:px-8 sm:py-4 sm:text-3xl"
            >
              On Hold
            </TabsTrigger>
            <TabsTrigger
              value="re_reading"
              className="shrink-0 whitespace-nowrap rounded px-6 py-3 text-2xl data-[state=active]:bg-gray-700 data-[state=inactive]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-white data-[state=inactive]:text-gray-400 sm:px-8 sm:py-4 sm:text-3xl"
            >
              Re-reading
            </TabsTrigger>
            <TabsTrigger
              value="dropped"
              className="shrink-0 whitespace-nowrap rounded px-6 py-3 text-2xl data-[state=active]:bg-gray-700 data-[state=inactive]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-white data-[state=inactive]:text-gray-400 sm:px-8 sm:py-4 sm:text-3xl"
            >
              Dropped
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-6 sm:mt-8">
          <LibraryList status={activeTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
