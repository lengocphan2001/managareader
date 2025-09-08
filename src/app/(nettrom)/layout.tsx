import { Inter } from "next/font/google";
import MainNav from "@/components/nettrom/layout/main-nav";
import Header from "@/components/nettrom/layout/header";
import { Constants } from "@/constants";
import "@/styles/nettrom/index.scss";
import { twMerge } from "tailwind-merge";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { Metadata } from "next";
import { Suspense } from "react";
import NextTopLoader from "nextjs-toploader";
import SettingsDialog from "@/components/nettrom/settings-dialog";
import VerifyMailAlert from "@/components/nettrom/verify-mail-alert";
import Footer from "@/components/core/Footer";
import ScriptInjector from "@/components/core/ScriptInjector";

export const metadata: Metadata = {
  title: `${Constants.APP_NAME} - High quality manga without ads`,
  description: `Read manga for free, high quality and support scanlation groups on ${Constants.APP_NAME}`,
  applicationName: Constants.APP_NAME,
  authors: [{ name: "TruyenDex", url: "https://github.com/zennomi/truyendex" }],
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
};

const inter = Inter({ subsets: ["latin"] });

export default function NettromLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWrapper id="nettrom">
      <ScriptInjector type="header" />
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
      <Suspense>
        <Header />
      </Suspense>
      <VerifyMailAlert />
      <nav className="main-nav hidden-xs" id="mainNav">
        <div className="inner bg-neutral-900">
          <div className="container">
            <div className="py-4">
              <MainNav />
            </div>
          </div>
        </div>
      </nav>
      <main
        className={twMerge(
          "main bg-neutral-900 text-foreground",
          inter.className,
        )}
      >
        <div className="container">{children}</div>
      </main>
      <Footer variant="default" />
      <SettingsDialog />
    </LayoutWrapper>
  );
}
