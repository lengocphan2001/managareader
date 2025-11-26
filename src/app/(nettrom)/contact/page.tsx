import { Metadata } from "next";
import { Constants } from "@/constants";
import ContactPageClient from "@/components/nettrom/lien-he/contact-page-client";

export const metadata: Metadata = {
  title: `Contact - ${Constants.APP_NAME}`,
};

export default function ContactPage() {
  return (
    <div className="w-full px-6 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:px-24 lg:py-12">
      <ContactPageClient />
    </div>
  );
}
