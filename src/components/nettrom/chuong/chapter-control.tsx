import Link from "next/link";
import { format } from "date-fns";
import { useChapterContext } from "@/contexts/chapter";
import { Utils } from "@/utils";
import { Constants } from "@/constants";
import { DataLoader } from "@/components/DataLoader";
import { ChapterControlBar } from "./chapter-control-bar";
import { useMemo } from "react";
import { FaClock } from "react-icons/fa";

export default function ChapterControl() {
  const { manga, chapter, others, group } = useChapterContext();

  const mangaTitle = useMemo(() => {
    return Utils.Mangadex.getMangaTitle(manga);
  }, [manga]);
  const chapterTitle = useMemo(() => {
    return Utils.Mangadex.getChapterTitle(chapter);
  }, [chapter]);

  return (
    <DataLoader
      isLoading={!chapter}
      loadingText="Loading chapter information..."
    >
      <div className="flex flex-col gap-0">
        {/* <ul
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
              <>
                <li
                  key={index}
                  itemProp="itemListElement"
                  itemType="http://schema.org/ListItem"
                >
                  <Link
                    href={item.href}
                    className="text-web-title transition hover:text-web-titleLighter"
                  >
                    <span itemProp="name">{item.name}</span>
                  </Link>
                  <meta
                    itemProp="position"
                    content={item.position.toString()}
                  />
                </li>
                {!isLast && (
                  <li
                    className="text-muted-foreground"
                    key={"divider_" + index}
                  >
                    /
                  </li>
                )}
              </>
            );
          })}
        </ul> */}
        <h1 className="mb-1 mt-0 md:mb-4">
          <Link
            className="text-[16px] text-web-title transition hover:text-web-titleLighter"
            href={Constants.Routes.nettrom.manga(manga?.id || "")}
          >
            {mangaTitle}
          </Link>{" "}
          <p className="my-0 text-[24px] leading-none text-foreground">
            {chapterTitle}{" "}
          </p>
        </h1>
        <p className="mb-2 md:mb-5">
          <span className="text-[14px] text-muted-foreground">
            <FaClock className="mr-2 inline" />
            Updated at:{" "}
            <span className="">
              {chapter &&
                format(
                  new Date(chapter.attributes.publishAt),
                  "HH:mm dd/MM/yyyy",
                )}
            </span>
            {group && (
              <span className="text-muted-foreground">
                {" "}
                by{" "}
                <Link href={Constants.Routes.nettrom.scanlationGroup(group.id)}>
                  {group.attributes.name}
                </Link>
              </span>
            )}
          </span>
        </p>
        <i></i>
      </div>
      <div className="reading-control">
        {others.length > 0 && (
          <div className="mrb5">
            Switch to other scanlation group
            <div className="mrt10">
              {others.map((other, idx) => (
                <Link
                  rel="nofollow"
                  key={other}
                  data-server={1}
                  className="loadchapter btn btn-primary btn-success mrb5"
                  href={Constants.Routes.nettrom.chapter(other)}
                >
                  Group {idx + 1}
                </Link>
              ))}
            </div>
          </div>
        )}

        <ChapterControlBar></ChapterControlBar>
        <div className="mb-4"></div>
      </div>
    </DataLoader>
  );
}
