"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Constants } from "@/constants";
import { MangadexApi } from "@/api";

export default function RandomPage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchRandomManga = async () => {
      try {
        // Add timestamp to prevent any caching
        const timestamp = Date.now();

        // Fetch random manga from Mangadex
        const {
          data: { data: manga },
        } = await MangadexApi.Manga.getMangaRandom({
          includes: [
            MangadexApi.Static.Includes.COVER_ART,
            MangadexApi.Static.Includes.AUTHOR,
            MangadexApi.Static.Includes.ARTIST,
          ],
          contentRating: [
            MangadexApi.Static.MangaContentRating.SAFE,
            MangadexApi.Static.MangaContentRating.SUGGESTIVE,
            MangadexApi.Static.MangaContentRating.EROTICA,
          ],
        });

        // Check if component is still mounted and manga exists
        if (isMounted && manga?.id) {
          // Redirect to manga detail page
          router.push(Constants.Routes.nettrom.manga(manga.id));
        } else if (isMounted) {
          // If no manga found, redirect to home
          router.push(Constants.Routes.nettrom.index);
        }
      } catch (error) {
        console.error("Error fetching random manga:", error);
        // On error, redirect to home
        if (isMounted) {
          router.push(Constants.Routes.nettrom.index);
        }
      }
    };

    fetchRandomManga();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Show loading state while fetching
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-2xl text-white">Loading random manga...</div>
    </div>
  );
}
