"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Search } from "lucide-react";

import { Button } from "@/components/nettrom/Button";
import { Constants } from "@/constants";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      // If no history, go to home page
      router.push(Constants.Routes.nettrom.index);
    }
  };

  const handleGoHome = () => {
    router.push(Constants.Routes.nettrom.index);
  };

  const handleSearch = () => {
    router.push(Constants.Routes.nettrom.search);
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <div className="mb-4 text-8xl font-bold text-red-500">404</div>
        <h1 className="mb-4 text-3xl font-bold text-gray-500">
          Manga/Chapter Not Found
        </h1>
        <p className="mb-6 max-w-md text-gray-200">
          The page you are looking for does not exist or has been moved. This
          manga/chapter may have been removed from MangaDex.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button onClick={handleGoBack} icon={<ArrowLeft className="size-6" />}>
          Go Back
        </Button>

        <Button
          onClick={handleGoHome}
          variant="outline"
          icon={<Home className="size-6" />}
        >
          Go Home
        </Button>

        <Button
          onClick={handleSearch}
          variant="ghost"
          icon={<Search className="size-6" />}
        >
          Search Other Manga
        </Button>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          If you think this is an error, please{" "}
          <a
            href={Constants.Routes.report}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            report
          </a>{" "}
          to us.
        </p>
      </div>
    </div>
  );
}
