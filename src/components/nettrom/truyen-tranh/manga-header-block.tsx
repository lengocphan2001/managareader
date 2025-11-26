"use client";

import Link from "next/link";

import { Constants } from "@/constants";
import { ExtendManga } from "@/types/mangadex";
import Iconify from "@/components/iconify";

interface MangaHeaderBlockProps {
  mangaId: string;
  manga: ExtendManga;
  coverArt: string;
  title: string;
  originalTitle?: string;
  author: string;
  artist?: string;
  description?: string;
  tags: Array<{ id: string; attributes: { name: { en?: string } } }>;
}

export default function MangaHeaderBlock({
  mangaId,
  manga,
  coverArt,
  title,
  originalTitle,
  author,
  artist,
  description,
  tags,
}: MangaHeaderBlockProps) {

  return (
    <div className="relative z-10 ml-0 mr-auto flex w-full pl-6 pt-16 sm:pt-20">
      <div className="relative flex w-full flex-row items-start lg:ml-16 gap-2 sm:gap-4 md:gap-6 lg:gap-8 py-8 sm:py-4 md:py-6 lg:py-8">
        {/* Cover Image - cắt xuống dưới background, full height với right block */}
        <div className="flex-shrink-0 relative">
          <Link
            href={Constants.Routes.nettrom.manga(mangaId)}
            className="group block relative z-20"
          >
            <div 
              className="w-32 sm:w-40 md:w-48 lg:w-56 xl:w-72 2xl:w-96 overflow-hidden transition-transform group-hover:scale-105 shadow-2xl relative"
              style={{
                aspectRatio: Constants.Nettrom.MANGA_COVER_RATIO,
              }}
            >
              <img
                src={coverArt}
                alt={title}
                className="h-full w-full rounded-lg object-cover"
              />
              {/* Japanese flag icon ở góc dưới bên phải nếu có original title */}
              {originalTitle && manga?.attributes?.originalLanguage === "ja" && (
                <div className="absolute bottom-2 right-2 z-10">
                  <Iconify icon="circle-flags:jp" className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-lg" />
                </div>
              )}
            </div>
          </Link>
        </div>
        
        {/* Title, Original Title, Author, Action Buttons */}
        <div className="flex min-w-0 flex-1 flex-col text-white" style={{ minHeight: '100%' }}>
          <div className="flex-1">
            <Link
              href={Constants.Routes.nettrom.manga(mangaId)}
              className="group no-underline hover:no-underline"
            >
              <h1 className="mb-2 text-4xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-tight text-white">
                {title}
              </h1>
            </Link>
            {originalTitle && (
              <p className="mb-2 sm:mb-3 text-xl text-gray-300">
                {originalTitle}
              </p>
            )}
            <div className="mb-4 sm:mb-6 text-xl text-white">
              <span>
                {author}
                {artist && artist !== author && `, ${artist}`}
              </span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

