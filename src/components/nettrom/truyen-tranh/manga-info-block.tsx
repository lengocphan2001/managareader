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
  const otherTags = tags.filter(
    (tag) => tag.attributes.name.en?.toLowerCase() !== "suggestive"
  ).slice(0, 4);

  return (
    <div className="w-full z-10 mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8 flex flex-col justify-center items-center">
      <div className="w-full flex items-center flex-col justify-center">
        {/* Action Buttons */}
        <div className="mb-2 sm:mb-4 md:mb-6 flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 justify-center">
          <Button
            className="bg-orange-500 text-white hover:bg-orange-600 flex-shrink-0 whitespace-nowrap text-xl sm:text-xl md:text-2xl lg:text-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3"
            onClick={handleAddToLibrary}
          >
            Add To Library
          </Button>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 flex-shrink-0 text-xl sm:text-xl md:text-2xl lg:text-2xl px-3 sm:px-4 py-2 sm:py-2.5 md:py-3">
            <Iconify icon="fa:star" className="text-xl sm:text-xl md:text-2xl lg:text-2xl" />
          </Button>
          <div className="flex-shrink-0 [&_button]:text-xl [&_button]:sm:text-xl [&_button]:md:text-2xl [&_button]:lg:text-2xl [&_button]:px-3 [&_button]:sm:px-4 [&_button]:md:px-6 [&_button]:py-2 [&_button]:sm:py-2.5 [&_button]:md:py-3">
            <FirstChapterButton mangaId={mangaId} />
          </div>
        </div>

        {/* Tags */}
        <div className="mb-2 sm:mb-3 md:mb-4 flex flex-wrap gap-1.5 sm:gap-2 justify-center">
          {contentRating === MangadexApi.Static.MangaContentRating.SUGGESTIVE && (
            <span className="rounded-full bg-orange-400/80 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xl sm:text-xl md:text-xl lg:text-2xl font-medium text-white">
              SUGGESTIVE
            </span>
          )}
          {otherTags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-gray-700/50 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xl sm:text-xl md:text-xl lg:text-2xl font-medium text-white"
            >
              {tag.attributes.name.en?.toUpperCase()}
            </span>
          ))}
        </div>

        {/* Publication Status */}
        <div className="mb-2 sm:mb-3 md:mb-4">
          <p className="text-xl sm:text-xl md:text-xl lg:text-2xl text-white text-center sm:text-left">
            PUBLICATION: {year ? `${year}, ` : ""}
            <span className={`inline-flex items-center gap-2 ml-2 ${isOngoing ? 'text-green-500' : 'text-white'}`}>
              {isOngoing && <span className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500"></span>}
              {Utils.Mangadex.translateStatus(status).toUpperCase()}
            </span>
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 lg:gap-6 text-xl sm:text-xl md:text-xl lg:text-2xl justify-center sm:justify-start">
          <span className="flex items-center gap-1 sm:gap-2 text-white">
            <Iconify icon="fa:star" className="text-white text-xl sm:text-xl md:text-xl lg:text-2xl" />
            <span className="text-orange-500">{rating}</span>
          </span>
          <span className="flex items-center gap-1 sm:gap-2 text-white">
            <Iconify icon="fa:bookmark" className="text-white text-xl sm:text-xl md:text-xl lg:text-2xl" />
            <span>{Utils.Number.formatViews(follows)}</span>
          </span>
          <span className="flex items-center gap-1 sm:gap-2 text-white">
            <Iconify icon="fa:comment" className="text-white text-xl sm:text-xl md:text-xl lg:text-2xl" />
            <span>{commentCount}</span>
          </span>
          <span className="flex items-center gap-1 sm:gap-2 text-gray-400">
            <Iconify icon="fa:eye" className="text-gray-400 text-xl sm:text-xl md:text-xl lg:text-2xl" />
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

