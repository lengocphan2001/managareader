import { Inter } from "next/font/google";
import { Constants } from "@/constants";
import "@/styles/nettrom/index.scss";
import { twMerge } from "tailwind-merge";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { Metadata } from "next";
import { Suspense, lazy } from "react";
import NextTopLoader from "nextjs-toploader";
import { SidebarProvider } from "@/contexts/sidebar";
import { DisplayModeProvider } from "@/contexts/display-mode";
import MainContentWrapper from "@/components/nettrom/layout/main-content-wrapper";

// Lazy load non-critical components
const SidebarNav = lazy(
  () => import("@/components/nettrom/layout/sidebar-nav"),
);
const Header = lazy(() => import("@/components/nettrom/layout/header"));
const SettingsDialog = lazy(
  () => import("@/components/nettrom/settings-dialog"),
);
const VerifyMailAlert = lazy(
  () => import("@/components/nettrom/verify-mail-alert"),
);

export const metadata: Metadata = {
  title: `${Constants.APP_NAME} - High quality manga without ads`,
  description: `Read manga for free, high quality and support scanlation groups on ${Constants.APP_NAME}`,
  applicationName: Constants.APP_NAME,
  authors: [{ name: "WowManga", url: "https://github.com/lengocphan2001/managareader" }],
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
  openGraph: {
    title: `${Constants.APP_NAME} - High quality manga without ads`,
    description: `Read manga for free, high quality and support scanlation groups on ${Constants.APP_NAME}`,
    url: Constants.APP_URL,
    siteName: Constants.APP_NAME,
    images: [
      {
        url: `${Constants.APP_URL}/images/opengraph.jpg`,
        width: 1200,
        height: 630,
        alt: `${Constants.APP_NAME} - High quality manga without ads`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${Constants.APP_NAME} - High quality manga without ads`,
    description: `Read manga for free, high quality and support scanlation groups on ${Constants.APP_NAME}`,
    images: [`${Constants.APP_URL}/twitter.jpg`],
  },
  other: {
    referrer: "same-origin",
  },
};

const inter = Inter({ subsets: ["latin"] });

export default function NettromLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWrapper id="nettrom">
      <NextTopLoader
        zIndex={1000}
        easing="ease-in-out"
        speed={200}
        height={4}
        showSpinner={false}
        template={`
        <div class="bar bg-web-title" role="bar"><div class="peg"></div></div> 
  <div class="spinner text-web-title" role="spinner"><div class="spinner-icon"></div></div>`}
      />
      <SidebarProvider>
        <DisplayModeProvider>
          <div className="flex min-h-screen">
            {/* Sidebar Navigation */}
            <Suspense fallback={<div className="w-96" />}>
              <SidebarNav />
            </Suspense>

            {/* Main Content Area */}
            <MainContentWrapper>
              <Suspense fallback={<div className="h-16" />}>
                <Header />
              </Suspense>
              <Suspense fallback={null}>
                <VerifyMailAlert />
              </Suspense>
              <main
                className={twMerge(
                  "main min-h-screen overflow-x-hidden bg-neutral-900 pt-16 text-foreground",
                  inter.className,
                )}
              >
                <div className="w-full max-w-full">{children}</div>
              </main>
            </MainContentWrapper>
          </div>
        </DisplayModeProvider>
      </SidebarProvider>
      <Suspense fallback={null}>
        <SettingsDialog />
      </Suspense>
    </LayoutWrapper>
  );
}
