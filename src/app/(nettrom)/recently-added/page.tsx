import { Metadata } from "next";
import { Suspense } from "react";
import RecentlyAddedClient from "@/components/nettrom/tim-kiem/recently-added-client";
import { Constants } from "@/constants";

export const metadata: Metadata = {
  title: `Recently Added - ${Constants.APP_NAME}`,
};

export default function RecentlyAdded() {
  return (
    <div className="w-full px-2 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:px-24 lg:py-12">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <RecentlyAddedClient />
      </Suspense>
    </div>
  );
}

