"use client";

import Link from "next/link";
import { useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { FaChevronRight } from "react-icons/fa";
import "swiper/css";

import { useSearchManga } from "@/hooks/mangadex";
import { useMangadex } from "@/contexts/mangadex";
import { Constants } from "@/constants";
import { Utils } from "@/utils";
import { ErrorDisplay } from "../error-display";
import { MangadexApi } from "@/api";
import LanguageIcon from "@/components/language-icon";

export default function SelfPublishedSlider() {
  const {
    mangaList: selfPublishedManga,
    isLoading,
    error,
    mutate,
  } = useSearchManga({
    limit: 20,
    includes: [MangadexApi.Static.Includes.COVER_ART],
    order: {
      createdAt: MangadexApi.Static.Order.DESC,
    },
    contentRating: [
      MangadexApi.Static.MangaContentRating.SAFE,
      MangadexApi.Static.MangaContentRating.SUGGESTIVE,
    ],
    hasAvailableChapters: "true",
    originalLanguage: ["en"],
  });
  const { addMangas } = useMangadex();

  useEffect(() => {
    if (selfPublishedManga.length > 0) addMangas(selfPublishedManga);
  }, [selfPublishedManga, addMangas]);

  if (isLoading) {
    return (
      <div className="px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-24 lg:py-12">
        <Skeleton height={200} />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} refresh={mutate} />;
  }

  if (selfPublishedManga.length === 0) {
    return null;
  }

  return (
    <div className="px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-24 lg:py-12">
      <div className="mb-6 flex items-center justify-between sm:mb-8 md:mb-10">
        <h1 className="text-left text-2xl font-semibold text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
          <span>Self-Published</span>
        </h1>
        <FaChevronRight className="ml-2 h-5 w-5 flex-shrink-0 cursor-pointer text-white transition-colors hover:text-orange-500 sm:h-6 sm:w-6 md:w-7" />
      </div>
      <Swiper
        modules={[Autoplay]}
        loop={selfPublishedManga.length > 10}
        loopAdditionalSlides={2}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={1000}
        slidesPerView={2}
        spaceBetween={8}
        breakpoints={{
          320: {
            slidesPerView: 2,
            spaceBetween: 10,
          },
          375: {
            slidesPerView: 2.5,
            spaceBetween: 10,
          },
          480: {
            slidesPerView: 3,
            spaceBetween: 12,
          },
          640: {
            slidesPerView: 3.5,
            spaceBetween: 12,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 16,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 18,
          },
          1280: {
            slidesPerView: 6,
            spaceBetween: 20,
          },
          1440: {
            slidesPerView: 7,
            spaceBetween: 22,
          },
          1536: {
            slidesPerView: 8,
            spaceBetween: 24,
          },
          1920: {
            slidesPerView: 9,
            spaceBetween: 24,
          },
        }}
        className="self-published-swiper"
      >
        {selfPublishedManga.map((manga) => {
          const mangaTitle = Utils.Mangadex.getMangaTitle(manga);
          const coverArt = Utils.Mangadex.getCoverArt(manga, 512);

          return (
            <SwiperSlide key={manga.id}>
              <Link
                href={Constants.Routes.nettrom.manga(manga.id)}
                className="group block no-underline hover:no-underline"
              >
                <div className="relative flex flex-col">
                  <div className="relative mb-2 overflow-hidden rounded">
                    <img
                      src={coverArt}
                      alt={mangaTitle}
                      className="h-auto w-full object-cover transition-transform group-hover:scale-105"
                      style={{
                        aspectRatio: Constants.Nettrom.MANGA_COVER_RATIO,
                      }}
                    />
                    {/* Flag icon at bottom right */}
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2">
                      <LanguageIcon
                        languageCode={manga.attributes.originalLanguage}
                        className="h-4 w-4 sm:h-5 sm:w-5"
                      />
                    </div>
                  </div>
                  <h3 className="line-clamp-2 text-left text-base font-medium text-white transition-colors group-hover:text-orange-500 sm:text-lg md:text-xl lg:text-2xl">
                    {mangaTitle}
                  </h3>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
