"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { FaExclamationTriangle } from "react-icons/fa";

import { useMangadex } from "@/contexts/mangadex";
import { AppApi, MangadexApi } from "@/api";
import Iconify from "@/components/iconify";
import { useSeriesInfo } from "@/hooks/core";
import { Utils } from "@/utils";
import ChapterList from "./chapter-list";
import { Constants } from "@/constants";
import { AspectRatio } from "@/components/shadcn/aspect-ratio";
import { Button } from "../Button";
import { DataLoader } from "@/components/DataLoader";
import { useChapterList } from "@/hooks/mangadex";
import { useSettingsContext } from "@/contexts/settings";
import { ExtendManga } from "@/types/mangadex";

import FirstChapterButton from "./first-chapter-button";
import ExternalLinks from "./external-links";
import Markdown from "../Markdown";

export default function Manga({
  mangaId,
  prefetchedManga,
}: {
  mangaId: string;
  prefetchedManga: ExtendManga;
}) {
  const { mangas, updateMangas, updateMangaStatistics, mangaStatistics } =
    useMangadex();
  const { filteredLanguages, filteredContent } = useSettingsContext();
  const manga = mangas[mangaId] || prefetchedManga;
  const { data: seriesInfo, mutate } = useSeriesInfo(mangaId);
  const title = Utils.Mangadex.getMangaTitle(manga);
  const altTitles = Utils.Mangadex.getMangaAltTitles(manga);
  const url = Constants.Routes.nettrom.manga(mangaId);
  const [page, setPage] = useState(0);
  const { data, chapters, error } = useChapterList(mangaId, {
    offset: page * Constants.Mangadex.CHAPTER_LIST_LIMIT,
    translatedLanguage: filteredLanguages,
  });
  const chapterListData = useMemo(() => data?.data, [data]);
  const router = useRouter();
  const [showPorngraphic, setShowPorngraphic] = useState(false);

  const handleLogin = () => {
    router.push(Constants.Routes.loginWithRedirect(window.location.pathname));
  };

  const handleConfirmPorngraphic = useCallback(() => {
    setShowPorngraphic(true);
  }, [setShowPorngraphic]);

  const followManga = useCallback(async () => {
    try {
      const { followed } = await AppApi.Series.followOrUnfollow(mangaId);
      toast(followed ? "Followed successfully" : "Unfollowed successfully");
      await mutate();
    } catch {
      toast("An error occurred");
    }
  }, [mutate, mangaId]);

  useEffect(() => {
    updateMangas({
      ids: [mangaId],
      includes: [
        MangadexApi.Static.Includes.ARTIST,
        MangadexApi.Static.Includes.AUTHOR,
      ],
    });
    updateMangaStatistics({ manga: [mangaId] });
  }, [mangaId]);

  if (
    !showPorngraphic &&
    !filteredContent.includes(
      MangadexApi.Static.MangaContentRating.PORNOGRAPHIC,
    ) &&
    manga.attributes.contentRating ===
      MangadexApi.Static.MangaContentRating.PORNOGRAPHIC
  )
    return (
      <div className="mb-2">
        <div className="flex flex-col justify-center">
          <FaExclamationTriangle className="mx-auto text-[100px] text-red-600" />
          <p className="text-center">
            This manga may contain sensitive content and you have set up filtering
            for manga with "adult" content
          </p>
        </div>
        <div className="mt-4 flex justify-center">
          <Button onClick={handleConfirmPorngraphic}>
            I take responsibility for my decision
          </Button>
        </div>
      </div>
    );

  return (
    <DataLoader
      isLoading={!manga}
      loadingText="Loading manga information..."
      error={error}
    >
      <ul
        className="mb-2 inline-flex items-center gap-4"
        itemType="http://schema.org/BreadcrumbList"
      >
        {[
          {
            href: Constants.Routes.nettrom.index,
            name: "Home",
            position: 1,
          },
          {
            href: Constants.Routes.nettrom.search,
            name: "Manga",
            position: 2,
          },
        ].map((item, index, arr) => {
          const isLast = index === arr.length - 1;
          return (
            <React.Fragment key={index}>
              <li
                itemProp="itemListElement"
                itemType="http://schema.org/ListItem"
              >
                <Link
                  href={item.href}
                  className="text-web-title transition hover:text-web-titleLighter"
                >
                  <span itemProp="name">{item.name}</span>
                </Link>
                <meta itemProp="position" content={item.position.toString()} />
              </li>
              {!isLast && (
                <li className="text-muted-foreground">
                  /
                </li>
              )}
            </React.Fragment>
          );
        })}
        {/* <li itemProp="itemListElement" itemType="http://schema.org/ListItem">
          <a
            href={url}
            className="itemcrumb active"
            itemProp="item"
            itemType="http://schema.org/Thing"
          >
            <span itemProp="name">{title}</span>
          </a>
          <meta itemProp="position" content={"3"} />
        </li> */}
      </ul>
      <article id="" className="dark:text-foreground">
        <div className="mb-[16px]">
          <h1 className="my-0 mb-4 text-[32px] font-semibold leading-tight">
            {title}
          </h1>
          <p className="inline-flex w-full gap-8 text-muted-foreground">
            <span>
              <i className="fa fa-star mr-2"></i>
              <span className="block sm:inline">
                <span className="text-foreground">
                  {mangaStatistics[mangaId]?.rating.bayesian.toFixed(2) || 10}
                </span>
                <span className="mx-2">/</span>
                <span itemProp="bestRating">10</span>
              </span>
            </span>
            <span>
              <i className="fa fa-heart mr-2" />
              <span className="block text-foreground sm:inline">
                {Utils.Number.formatViews(
                  mangaStatistics[mangaId]?.follows || 0,
                )}
              </span>
            </span>
            <span>
              <i className="fa fa-comment mr-2" />
              <span className="block text-foreground sm:inline">
                {Utils.Number.formatViews(seriesInfo?.comment_count || 0)}
              </span>
            </span>
            <span className="lg:grow"></span>
            <span className="text-muted-foreground">
              <i className="fa fa-clock mr-2" />
              <span className="block sm:inline">
                <span className="hidden lg:inline">Updated: </span>
                <span className="text-foreground">
                  {manga?.attributes?.updatedAt
                    ? Utils.Date.formatNowDistance(
                        new Date(manga?.attributes?.updatedAt),
                      )
                    : ""}{" "}
                  ago
                </span>
              </span>
            </span>
          </p>
        </div>
        <div className="detail-info mb-10">
          <div className="grid grid-cols-[1fr_2fr] gap-10">
            <div className="">
              <div className="relative w-full">
                <AspectRatio
                  className="overflow-hidden rounded-lg shadow-lg"
                  ratio={Constants.Nettrom.MANGA_COVER_RATIO}
                >
                  <img
                    className="h-full w-full object-cover"
                    src={Utils.Mangadex.getCoverArt(manga, 512)}
                    alt={title}
                  />
                </AspectRatio>
              </div>
            </div>
            <div>
              <ul className="[&>li]:grid [&>li]:lg:grid-cols-[1fr_2fr]">
                {altTitles.length > 0 && (
                  <li className="">
                    <p className="name mb-2 text-muted-foreground lg:mb-0">
                      <i className="fa fa-plus-square mr-2"></i> Alternative Names
                    </p>
                    <p className="other-name inline-flex flex-wrap gap-4 pl-10 lg:pl-0">
                      {altTitles.map((altTitle, idx) => {
                        return <span key={idx}>{altTitle}</span>;
                      })}
                    </p>
                  </li>
                )}
                <li className="author">
                  <p className="name mb-2 text-muted-foreground lg:mb-0">
                    <i className="fa fa-user mr-2"></i> Author
                  </p>
                  <p className="pl-10 lg:pl-0">
                    {manga?.author?.attributes
                      ? manga?.author?.attributes.name
                      : "N/A"}{" "}
                    <span className="text-muted-foreground">/</span>{" "}
                    {manga?.artist?.attributes
                      ? manga?.artist?.attributes.name
                      : "N/A"}
                  </p>
                </li>
                <li className="status">
                  <p className="name mb-2 text-muted-foreground lg:mb-0">
                    <i className="fa fa-rss mr-2"></i> Status
                  </p>
                  <p className="pl-10 lg:pl-0">
                    {manga?.attributes.year
                      ? `${manga.attributes.year} - `
                      : ""}
                    {Utils.Mangadex.translateStatus(manga?.attributes.status)}
                  </p>
                </li>
                <li className="kind">
                  <p className="name mb-2 text-muted-foreground lg:mb-0">
                    <i className="fa fa-exclamation-triangle mr-2"></i> Content
                  </p>
                  <p className="pl-10 lg:pl-0">
                    {Utils.Mangadex.translateContentRating(
                      manga?.attributes.contentRating,
                    )}
                  </p>
                </li>
                <li className="kind">
                  <p className="name mb-2 text-muted-foreground lg:mb-0">
                    <i className="fa fa-tags mr-2"></i> Genres
                  </p>
                  <p className="pl-10 lg:pl-0">
                    {manga?.attributes.tags.map((tag, idx) => (
                      <>
                        <Link
                          key={tag.id}
                          href={`${Constants.Routes.nettrom.search}?includedTags=${tag.id}`}
                          className="text-web-title transition hover:text-web-titleLighter"
                        >
                          {tag.attributes.name.en}
                        </Link>
                        {idx !== manga?.attributes.tags.length - 1 && (
                          <span
                            key={"divider_" + idx}
                            className="text-muted-foreground"
                          >
                            ,{" "}
                          </span>
                        )}
                      </>
                    ))}
                  </p>
                </li>
                <li className="">
                  <p className="name mb-2 text-muted-foreground lg:mb-0">
                    <i className="fa fa-globe mr-2"></i> Original Language
                  </p>
                  <p className="flex items-center gap-2 pl-10 lg:pl-0">
                    <Iconify
                      icon={`circle-flags:lang-${manga.attributes.originalLanguage}`}
                      className="inline-block"
                    />
                    <span>
                      {Utils.Mangadex.translateISOLanguage(
                        manga.attributes.originalLanguage,
                      )}
                    </span>
                  </p>
                </li>
                <li className="">
                  <p className="name mb-2 text-muted-foreground lg:mb-0">
                    <i className="fa fa-chain mr-2"></i> Source
                  </p>
                  {manga && (
                    <ExternalLinks
                      links={manga.attributes.links}
                      mangaId={manga.id}
                    />
                  )}
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 grid sm:grid-cols-[1fr_2fr] sm:gap-10">
            <div></div>
            <div className="grid flex-wrap gap-4 sm:flex sm:grid-cols-2">
              <FirstChapterButton mangaId={mangaId} />
              {seriesInfo &&
                (seriesInfo.followed !== null ? (
                  <Button
                    className="w-full border-red-500 text-red-500 hover:bg-red-300/10 hover:text-red-500 sm:w-auto"
                    icon={
                      <Iconify
                        icon={
                          seriesInfo.followed ? "fa:times-circle" : "fa:heart"
                        }
                      />
                    }
                    variant={"outline"}
                    onClick={followManga}
                  >
                    <span>
                      {seriesInfo.followed ? "Unfollow" : "Follow"}
                    </span>
                  </Button>
                ) : (
                  <Button
                    className="w-full sm:w-auto"
                    icon={<Iconify icon="fa:heart" />}
                    variant={"outline"}
                    onClick={handleLogin}
                  >
                    Login to follow
                  </Button>
                ))}
            </div>
          </div>
        </div>
        <div className="detail-content mb-10">
          <h2 className="mb-4 flex items-center gap-4 text-[20px] font-medium text-web-title">
            <i className="fa fa-pen"></i>
            <span>Content</span>
          </h2>
          <div className="w-full">
            {
              <Markdown
                content={
                  manga?.attributes?.description.vi ||
                  manga?.attributes?.description.en ||
                  ""
                }
              />
            }
            <p className="text-muted-foreground">
              Manga{" "}
              <Link
                href={url}
                className="text-web-title transition hover:text-web-titleLighter"
              >
                {title}
              </Link>{" "}
              is updated quickly and completely at{" "}
              <Link
                href={"/"}
                className="text-web-title transition hover:text-web-titleLighter"
              >
                {Constants.APP_NAME}
              </Link>
              . Don't forget to leave comments and share, support{" "}
              {Constants.APP_NAME} to release the latest chapters of{" "}
              <Link
                href={url}
                className="text-web-title transition hover:text-web-titleLighter"
              >
                {title}
              </Link>
              .
            </p>
          </div>
          {/* <a href="#" className="morelink less">
                        <i className="fa fa-angle-left" /> Thu gọn
                    </a> */}
        </div>
        <ChapterList
          mangaId={mangaId}
          page={page}
          onPageChange={setPage}
          data={chapterListData}
          items={chapters}
        />
      </article>
    </DataLoader>
  );
}
