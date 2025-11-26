"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import AuthRequired from "../auth-required";
import LibraryList from "./library-list";
import { Constants } from "@/constants";
import { FaArrowLeft } from "react-icons/fa";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shadcn/tabs";
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
      <div className="p-5 mb-6 sm:mb-8 md:mb-10">
        <Link
          href={Constants.Routes.nettrom.index}
          className="inline-flex items-center gap-3 sm:gap-4 text-white text-4xl sm:text-5xl md:text-6xl font-semibold no-underline hover:no-underline"
        >
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors">
            <FaArrowLeft className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </div>
          <span>Library</span>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full mb-6 sm:mb-8 md:mb-10">
        <div className="overflow-x-auto">
          <TabsList className="bg-transparent gap-2 sm:gap-3 !h-auto">
          <TabsTrigger 
            value="reading" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:font-bold data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 text-2xl sm:text-3xl px-6 sm:px-8 py-3 sm:py-4 rounded whitespace-nowrap shrink-0"
          >
            Reading
          </TabsTrigger>
          <TabsTrigger 
            value="plan_to_read" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:font-bold data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 text-2xl sm:text-3xl px-6 sm:px-8 py-3 sm:py-4 rounded whitespace-nowrap shrink-0"
          >
            Plan To Read
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:font-bold data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 text-2xl sm:text-3xl px-6 sm:px-8 py-3 sm:py-4 rounded whitespace-nowrap shrink-0"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger 
            value="on_hold" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:font-bold data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 text-2xl sm:text-3xl px-6 sm:px-8 py-3 sm:py-4 rounded whitespace-nowrap shrink-0"
          >
            On Hold
          </TabsTrigger>
          <TabsTrigger 
            value="re_reading" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:font-bold data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 text-2xl sm:text-3xl px-6 sm:px-8 py-3 sm:py-4 rounded whitespace-nowrap shrink-0"
          >
            Re-reading
          </TabsTrigger>
          <TabsTrigger 
            value="dropped" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:font-bold data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 text-2xl sm:text-3xl px-6 sm:px-8 py-3 sm:py-4 rounded whitespace-nowrap shrink-0"
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

