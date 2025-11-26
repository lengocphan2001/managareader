import { Metadata } from "next";
import { Constants } from "@/constants";
import AboutPageClient from "@/components/nettrom/gioi-thieu/about-page-client";

export const metadata: Metadata = {
  title: `About Us - ${Constants.APP_NAME}`,
};

export default function AboutPage() {
  return (
    <div className="w-full px-6 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:px-24 lg:py-12">
      <AboutPageClient />
    </div>
  );
}

