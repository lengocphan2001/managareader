import { Metadata } from "next";
import { Constants } from "@/constants";
import HistoryPageClient from "@/components/nettrom/lich-su/history-page-client";

export const metadata: Metadata = {
  title: `Reading History at ${Constants.APP_NAME}`,
};

export default function History() {
  return (
    <div className="w-full px-2 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:px-24 lg:py-12">
      <HistoryPageClient />
    </div>
  );
}
