"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { FaClock } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";

import { useFeaturedTitles } from "@/hooks/mangadex";
import { useMangadex } from "@/contexts/mangadex";
import { useSidebar } from "@/contexts/sidebar";
import { Constants } from "@/constants";
import { Utils } from "@/utils";
import { ErrorDisplay } from "../error-display";

export default function PopularNewTitles() {
  const {
    mangaList: featuredTitles,
    isLoading,
    error,
    mutate,
  } = useFeaturedTitles();
  const { addMangas } = useMangadex();
  const { isOpen } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (featuredTitles.length > 0) addMangas(featuredTitles);
  }, [featuredTitles, addMangas]);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  if (isLoading) {
    return (
      <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-neutral-800 sm:h-[350px] md:h-[400px]">
        <Skeleton height="100%" width="100%" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay error={error} refresh={mutate} />;
  }

  if (featuredTitles.length === 0) {
    return null;
  }

  // Get the first featured title for the main banner
  const mainTitle = featuredTitles[0];
  const title = Utils.Mangadex.getMangaTitle(mainTitle);
  const coverArt = Utils.Mangadex.getCoverArt(mainTitle, 512);
  const description = Utils.Mangadex.transLocalizedStr(
    mainTitle.attributes.description,
  );
  const tags =
    mainTitle.attributes.tags
      ?.slice(0, 2)
      .map((tag) => Utils.Mangadex.transLocalizedStr(tag.attributes.name))
      .join(" ") || "";

  return (
    <div
      className="relative -mt-16 overflow-hidden bg-neutral-800"
      style={{
        position: "relative",
        left: 0,
        right: 0,
      }}
    >
      <Swiper
        modules={[Pagination, Autoplay]}
        autoplay={{ delay: 5000 }}
        pagination={{ clickable: true }}
        loop={true}
        className="popular-titles-swiper h-[300px] w-full sm:h-[350px] md:h-[400px]"
        style={
          {
            "--swiper-pagination-color": "#f97316",
          } as React.CSSProperties
        }
      >
        {featuredTitles.slice(0, 5).map((manga) => {
          const mangaTitle = Utils.Mangadex.getMangaTitle(manga);
          const mangaCover = Utils.Mangadex.getCoverArt(manga, 512);
          const mangaDescription = Utils.Mangadex.transLocalizedStr(
            manga.attributes.description,
          );
          const mangaTags =
            manga.attributes.tags
              ?.slice(0, 4)
              .map((tag) =>
                Utils.Mangadex.transLocalizedStr(tag.attributes.name),
              ) || [];

          return (
            <SwiperSlide key={manga.id}>
              <div className="relative flex h-[300px] w-full items-center sm:h-[350px] md:h-[400px]">
                {/* Background Image - Full Width */}
                <div
                  className="absolute bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${mangaCover})`,
                    filter: "brightness(0.5)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    width: "100vw",
                    height: "100%",
                    left: "50%",
                    right: "50%",
                    marginLeft: "-50vw",
                    marginRight: "-50vw",
                    top: 0,
                    bottom: 0,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/80 via-neutral-900/60 to-neutral-900/40" />

                {/* Content */}
                <div
                  className={`relative z-10 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-12 2xl:px-24`}
                  style={{
                    width: "100%",
                    maxWidth:
                      isDesktop && isOpen ? "calc(100vw - 384px)" : "100%",
                    marginLeft: isDesktop && isOpen ? "384px" : "auto",
                    marginRight: "auto",
                  }}
                >
                  <div className="flex w-full flex-col gap-4 sm:flex-row sm:gap-6 md:gap-8">
                    {/* Manga Cover and Details */}
                    <div className="flex flex-1 flex-row gap-4 sm:gap-6 md:gap-8">
                      {/* Manga Cover */}
                      <Link
                        href={Constants.Routes.nettrom.manga(manga.id)}
                        className="group block flex-shrink-0"
                      >
                        <div
                          className="h-48 w-32 overflow-hidden rounded-lg transition-transform group-hover:scale-105 sm:h-60 sm:w-40 md:h-48 md:w-48 lg:h-[200px] lg:w-56"
                          style={{
                            aspectRatio: Constants.Nettrom.MANGA_COVER_RATIO,
                          }}
                        >
                          <img
                            src={mangaCover}
                            alt={mangaTitle}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </Link>

                      {/* Manga Details */}
                      <div className="flex flex-col justify-between text-white">
                        <div>
                          <Link
                            href={Constants.Routes.nettrom.manga(manga.id)}
                            className="group no-underline hover:no-underline"
                          >
                            <h2 className="mb-3 line-clamp-2 text-2xl font-bold leading-tight text-white sm:mb-4 sm:line-clamp-none md:mb-6">
                              {mangaTitle}
                            </h2>
                          </Link>

                          <div className="mb-3 flex items-center gap-4 text-2xl text-white sm:mb-4 sm:gap-6">
                            <span className="flex items-center gap-2">
                              <FaClock className="h-5 w-5 sm:h-6 sm:w-6" />
                              {Utils.Date.formatNowDistance(
                                new Date(manga.attributes.updatedAt),
                              )}{" "}
                              ago
                            </span>
                          </div>
                          {mangaTags.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2 sm:mb-4">
                              {mangaTags.map((tagName, index) => (
                                <span
                                  key={index}
                                  className="inline-block rounded bg-neutral-800/90 px-2 py-1 text-2xl font-medium uppercase text-white sm:px-3 sm:py-1.5 md:px-4 md:py-2"
                                >
                                  {tagName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {manga.author?.attributes?.name && (
                          <p className="text-2xl text-white">
                            {manga.author.attributes.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
