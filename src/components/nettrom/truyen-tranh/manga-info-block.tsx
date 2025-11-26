"use client";

import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "nextjs-toploader/app";

import { AppApi } from "@/api";
import { Constants } from "@/constants";
import { Utils } from "@/utils";
import { ExtendManga } from "@/types/mangadex";
import { useSeriesInfo } from "@/hooks/core";
import { useMangadex } from "@/contexts/mangadex";
import Iconify from "@/components/iconify";
import FirstChapterButton from "./first-chapter-button";
import { Button } from "../Button";
import { MangadexApi } from "@/api";
import AddToLibraryModal from "./add-to-library-modal";
import { useAuth } from "@/hooks/useAuth";

interface MangaInfoBlockProps {
  mangaId: string;
  manga: ExtendManga;
}

export default function MangaInfoBlock({
  mangaId,
  manga,
}: MangaInfoBlockProps) {
  const { data: seriesInfo, mutate } = useSeriesInfo(mangaId);
  const { mangaStatistics } = useMangadex();
  const router = useRouter();
  const { user } = useAuth();
  const [isAddToLibraryModalOpen, setIsAddToLibraryModalOpen] = useState(false);

  const handleLogin = () => {
    router.push(Constants.Routes.loginWithRedirect(window.location.pathname));
  };

  const handleAddToLibrary = () => {
    if (!user) {
      handleLogin();
      return;
    }
    setIsAddToLibraryModalOpen(true);
  };

  const followManga = useCallback(async () => {
    try {
      const { followed } = await AppApi.Series.followOrUnfollow(mangaId);
      toast(followed ? "Followed successfully" : "Unfollowed successfully");
      await mutate();
    } catch {
      toast("An error occurred");
    }
  }, [mutate, mangaId]);

  const rating = mangaStatistics[mangaId]?.rating.bayesian.toFixed(2) || "0.00";
  const follows = mangaStatistics[mangaId]?.follows || 0;
  const commentCount = seriesInfo?.comment_count || 0;
  const status = manga?.attributes.status || "ongoing";
  const year = manga?.attributes.year;
  const isOngoing = status === "ongoing";
  const contentRating = manga?.attributes.contentRating;

  // Lấy tags, tag đầu tiên là SUGGESTIVE nếu có
  const tags = manga?.attributes.tags || [];
  const otherTags = tags
    .filter((tag) => tag.attributes.name.en?.toLowerCase() !== "suggestive")
    .slice(0, 4);

  return (
    <div className="z-10 mx-auto flex w-full flex-col items-center justify-center px-2 py-2 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div className="flex w-full flex-col items-center justify-center">
        {/* Action Buttons */}
        <div className="mb-2 flex flex-wrap justify-center gap-1.5 sm:mb-4 sm:gap-2 md:mb-6 md:gap-3">
          <Button
            className="flex-shrink-0 whitespace-nowrap bg-orange-500 px-3 py-2 text-xl text-white hover:bg-orange-600 sm:px-4 sm:py-2.5 sm:text-xl md:px-6 md:py-3 md:text-2xl lg:text-2xl"
            onClick={handleAddToLibrary}
          >
            Add To Library
          </Button>
          <Button
            variant="outline"
            className="flex-shrink-0 border-white/20 px-3 py-2 text-xl text-white hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-xl md:py-3 md:text-2xl lg:text-2xl"
          >
            <Iconify
              icon="fa:star"
              className="text-xl sm:text-xl md:text-2xl lg:text-2xl"
            />
          </Button>
          <div className="flex-shrink-0 [&_button]:px-3 [&_button]:py-2 [&_button]:text-xl [&_button]:sm:px-4 [&_button]:sm:py-2.5 [&_button]:sm:text-xl [&_button]:md:px-6 [&_button]:md:py-3 [&_button]:md:text-2xl [&_button]:lg:text-2xl">
            <FirstChapterButton mangaId={mangaId} />
          </div>
        </div>

        {/* Tags */}
        <div className="mb-2 flex flex-wrap justify-center gap-1.5 sm:mb-3 sm:gap-2 md:mb-4">
          {contentRating ===
            MangadexApi.Static.MangaContentRating.SUGGESTIVE && (
            <span className="rounded-full bg-orange-400/80 px-2 py-1 text-xl font-medium text-white sm:px-3 sm:py-1.5 sm:text-xl md:px-4 md:py-2 md:text-xl lg:text-2xl">
              SUGGESTIVE
            </span>
          )}
          {otherTags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-gray-700/50 px-2 py-1 text-xl font-medium text-white sm:px-3 sm:py-1.5 sm:text-xl md:px-4 md:py-2 md:text-xl lg:text-2xl"
            >
              {tag.attributes.name.en?.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Publication Status */}
        <div className="mb-2 sm:mb-3 md:mb-4">
          <p className="text-center text-xl text-white sm:text-left sm:text-xl md:text-xl lg:text-2xl">
            PUBLICATION: {year ? `${year}, ` : ""}
            <span
              className={`ml-2 inline-flex items-center gap-2 ${isOngoing ? "text-green-500" : "text-white"}`}
            >
              {isOngoing && (
                <span className="h-2 w-2 rounded-full bg-green-500 sm:h-3 sm:w-3"></span>
              )}
              {Utils.Mangadex.translateStatus(status).toUpperCase()}
            </span>
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-2 text-xl sm:justify-start sm:gap-3 sm:text-xl md:gap-4 md:text-xl lg:gap-6 lg:text-2xl">
          <span className="flex items-center gap-1 text-white sm:gap-2">
            <Iconify
              icon="fa:star"
              className="text-xl text-white sm:text-xl md:text-xl lg:text-2xl"
            />
            <span className="text-orange-500">{rating}</span>
          </span>
          <span className="flex items-center gap-1 text-white sm:gap-2">
            <Iconify
              icon="fa:bookmark"
              className="text-xl text-white sm:text-xl md:text-xl lg:text-2xl"
            />
            <span>{Utils.Number.formatViews(follows)}</span>
          </span>
          <span className="flex items-center gap-1 text-white sm:gap-2">
            <Iconify
              icon="fa:comment"
              className="text-xl text-white sm:text-xl md:text-xl lg:text-2xl"
            />
            <span>{commentCount}</span>
          </span>
          <span className="flex items-center gap-1 text-gray-400 sm:gap-2">
            <Iconify
              icon="fa:eye"
              className="text-xl text-gray-400 sm:text-xl md:text-xl lg:text-2xl"
            />
            <span>N/A</span>
          </span>
        </div>
      </div>

      {/* Add To Library Modal */}
      <AddToLibraryModal
        isOpen={isAddToLibraryModalOpen}
        onClose={() => setIsAddToLibraryModalOpen(false)}
        manga={manga}
        mangaId={mangaId}
        onSuccess={() => {
          mutate();
        }}
      />
    </div>
  );
}
