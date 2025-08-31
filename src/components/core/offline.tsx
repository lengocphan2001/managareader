"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { Constants } from "@/constants";
import useAvailableDomain from "@/hooks/useAvailableDomain";
import useHostname from "@/hooks/useHostname";
import useOnlineStatus from "@/hooks/useOnlineStatus";

export default function OfflineView() {
  const isOnline = useOnlineStatus();
  const hostname = useHostname();
  const pathname = usePathname();
  const router = useRouter();
  const { data: availableDomain, isLoading } = useAvailableDomain(
    !!isOnline && !!hostname,
  );

  useEffect(() => {
    (async () => {
      if (availableDomain === undefined || isLoading) return;
      if (availableDomain === null) {
        toast(
          "No domains available. Please click the button below for support.",
        );
      } else {
        toast(`${availableDomain} is available, redirecting...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        router.push(`https://${availableDomain}${pathname}`);
      }
    })();
  }, [availableDomain, isLoading]);

  if (!isOnline)
    return (
      <section className="relative bg-indigo-600/5">
        <div className="container-fluid relative">
          <div className="grid grid-cols-1">
            <div className="flex min-h-screen flex-col justify-center px-4 py-10 md:px-10">
              <div className="title-heading my-auto text-center">
                <h1 className="mb-6 mt-3 text-3xl font-bold md:text-5xl">
                  Disconnect network
                </h1>
                <p className="text-slate-400">
                  Please check your network connection
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );

  return (
    <section className="relative bg-indigo-600/5">
      <div className="container-fluid relative">
        <div className="grid grid-cols-1">
          <div className="flex min-h-screen flex-col justify-center px-4 py-10 md:px-10">
            <div className="title-heading my-auto text-center">
              <h1 className="mb-6 mt-3 text-3xl font-bold md:text-5xl">
                Domain {hostname} is blocked
              </h1>
              <p className="text-slate-400">
                {isLoading
                  ? "But chill, let me find another available domain"
                  : !!availableDomain
                    ? "Redirecting..."
                    : "Please click the button below for support"}
              </p>
              {isLoading && (
                <Loader2 className="mx-auto my-3 h-[40px] w-[40px] animate-spin" />
              )}
              <div className="mt-4">
                <Link
                  href={Constants.Routes.report}
                  target="_blank"
                  className="inline-block rounded-md border border-indigo-600 bg-indigo-600 px-5 py-2 text-center align-middle text-base font-semibold tracking-wide text-white duration-500 hover:border-indigo-700 hover:bg-indigo-700"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
