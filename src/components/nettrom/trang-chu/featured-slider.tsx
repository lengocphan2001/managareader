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

export default function FeaturedSlider() {
  const {
    mangaList: featuredManga,
    isLoading,
    error,
    mutate,
  } = useSearchManga({
    limit: 20,
    includes: [MangadexApi.Static.Includes.COVER_ART],
    order: {
      followedCount: MangadexApi.Static.Order.DESC,
    },
    contentRating: [
      MangadexApi.Static.MangaContentRating.SAFE,
      MangadexApi.Static.MangaContentRating.SUGGESTIVE,
    ],
    hasAvailableChapters: "true",
  });
  const { addMangas } = useMangadex();

  useEffect(() => {
    if (featuredManga.length > 0) addMangas(featuredManga);
  }, [featuredManga, addMangas]);

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

  if (featuredManga.length === 0) {
    return null;
  }

  return (
    <div className="px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 lg:px-24 lg:py-12">
        <div className="mb-6 sm:mb-8 md:mb-10 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white text-left">
            <span>Featured</span>
          </h1>
          <FaChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:w-7 text-white cursor-pointer hover:text-orange-500 transition-colors flex-shrink-0 ml-2" />
        </div>
        <Swiper
          modules={[Autoplay]}
          loop={featuredManga.length > 10}
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
          className="featured-swiper"
        >
          {featuredManga.map((manga) => {
            const mangaTitle = Utils.Mangadex.getMangaTitle(manga);
            const coverArt = Utils.Mangadex.getCoverArt(manga, 512);

            return (
              <SwiperSlide key={manga.id}>
                <Link
                  href={Constants.Routes.nettrom.manga(manga.id)}
                  className="block group no-underline hover:no-underline"
                >
                  <div className="flex flex-col relative">
                    <div className="mb-2 overflow-hidden rounded relative">
                      <img
                        src={coverArt}
                        alt={mangaTitle}
                        className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                        style={{ aspectRatio: Constants.Nettrom.MANGA_COVER_RATIO }}
                      />
                      {/* Flag icon at bottom right */}
                      <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2">
                        <LanguageIcon
                          languageCode={manga.attributes.originalLanguage}
                          className="w-4 h-4 sm:w-5 sm:h-5"
                        />
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-white text-left line-clamp-2 group-hover:text-orange-500 transition-colors">
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

