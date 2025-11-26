import { Metadata } from "next";
import { Suspense } from "react";
import LatestUpdatesClient from "@/components/nettrom/tim-kiem/latest-updates-client";
import { Constants } from "@/constants";

export const metadata: Metadata = {
  title: `Latest Updates - ${Constants.APP_NAME}`,
};

export default function LatestUpdates() {
  return (
    <div className="w-full px-2 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:px-24 lg:py-12">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LatestUpdatesClient />
      </Suspense>
    </div>
  );
}

