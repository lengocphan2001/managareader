import { GoogleTagManager } from "@next/third-parties/google";

import { PropsWithChildren } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "swiper/css";
import "@fortawesome/fontawesome-free/css/all.css";
import "@/styles/base/index.scss";
import "react-loading-skeleton/dist/skeleton.css";

import { MangadexContextProvider } from "@/contexts/mangadex";
import { Constants } from "@/constants";
import { SettingsProvider } from "@/contexts/settings";
import { SkeletonTheme } from "react-loading-skeleton";
import ScriptInjector from "./core/ScriptInjector";

// Remove server-side cookies usage - handle on client side
export const LayoutWrapper = ({
  children,
  ...props
}: PropsWithChildren & {
  id: string;
}) => {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      {Constants.GTM_ID && Constants.GTM_ID !== "GTM-XXXXXXX" && (
        <GoogleTagManager gtmId={Constants.GTM_ID} />
      )}
      <head>
        <link rel="dns-prefetch" href="https://mangadex.org" />
        <link rel="dns-prefetch" href="https://api.truyendex.xyz" />
        <link rel="dns-prefetch" href="https://api-proxy.truyendex.xyz" />
        <link rel="dns-prefetch" href="https://cdn.truyendex.xyz" />

        <link rel="dns-prefetch" href="https://api.truyendex.com" />

        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.gstatic.com" />

        {/* Preload critical routes */}
        <link rel="prefetch" href="/nettrom" />
        <link rel="prefetch" href="/login" />
        <link rel="prefetch" href="/profile" />
      </head>
      <body data-layout-id={props.id}>
        <SettingsProvider>
          <SkeletonTheme baseColor="#202020" highlightColor="#444">
            <MangadexContextProvider>
              <ScriptInjector type="header" />
              {children}
            </MangadexContextProvider>
          </SkeletonTheme>
        </SettingsProvider>
        <ToastContainer theme="dark" />
      </body>
    </html>
  );
};
