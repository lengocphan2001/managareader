import { LayoutWrapper } from "@/components/LayoutWrapper";
import "@/styles/core/index.scss";

import { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

import { Constants } from "@/constants";
import dynamic from "next/dynamic";

// Dynamic import ScriptInjector to avoid SSR issues
const ScriptInjector = dynamic(
  () => import("@/components/core/ScriptInjector"),
  {
    ssr: false,
  },
);

export const metadata: Metadata = {
  title: `${Constants.APP_NAME} - Truyện tranh chất lượng cao`,
  description: `Đọc truyện miễn phí, chất lượng cao và tham gia ủng hộ nhóm dịch trên ${Constants.APP_NAME}`,
  applicationName: Constants.APP_NAME,
  authors: [
    {
      name: "MangaApp",
      url: "https://github.com/lengocphan2001/managareader.git",
    },
  ],
  keywords: [
    "manga",
    "manga",
    "manhwa",
    "manhua",
    "nettruyen",
    "nettrom",
    "blogtruyen",
    "truyendex",
  ],
  metadataBase: new URL(Constants.APP_URL),
  other: {
    referrer: "same-origin",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: `${Constants.APP_NAME} - Truyện tranh chất lượng cao`,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
};

export default function CoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWrapper id="core">
      <ScriptInjector type="header" />
      <NextTopLoader
        zIndex={1000}
        easing="ease-in-out"
        speed={200}
        height={4}
        showSpinner={false}
        template={`
        <div class="bar bg-indigo-500" role="bar"><div class="peg"></div></div> 
  <div class="spinner text-indigo-500" role="spinner"><div class="spinner-icon"></div></div>`}
      />
      <main className="min-h-screen">{children}</main>
    </LayoutWrapper>
  );
}
