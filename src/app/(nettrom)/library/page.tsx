import { Metadata } from "next";
import { Constants } from "@/constants";
import LibraryPageClient from "@/components/nettrom/thu-vien/library-page-client";

export const metadata: Metadata = {
  title: `Library at ${Constants.APP_NAME}`,
};

export default function Library() {
  return (
    <div className="w-full px-2 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:px-24 lg:py-12">
      <LibraryPageClient />
    </div>
  );
}
