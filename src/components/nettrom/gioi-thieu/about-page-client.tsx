"use client";

import Link from "next/link";
import { Constants } from "@/constants";
import { FaArrowLeft } from "react-icons/fa";

export default function AboutPageClient() {
  return (
    <div className="w-full">
      {/* Header with back arrow */}
      <div className="mb-6 p-5 sm:mb-8 md:mb-10">
        <Link
          href={Constants.Routes.nettrom.index}
          className="inline-flex items-center gap-3 text-4xl font-semibold text-white no-underline hover:no-underline sm:gap-4 sm:text-5xl md:text-6xl"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800 transition-colors hover:bg-neutral-700 sm:h-16 sm:w-16 md:h-20 md:w-20">
            <FaArrowLeft className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </div>
          <span>About Us</span>
        </Link>
      </div>

      {/* Introduction Paragraphs */}
      <div className="mb-6 space-y-4 sm:mb-8 sm:space-y-5 md:mb-10 md:space-y-6">
        <p className="text-2xl leading-relaxed text-white">
          MangaDex is an online manga reader that caters to all languages.
          MangaDex is made for content creators like mangaka and comic creators,
          translators, publishers and more, providing complete control over
          their content.
        </p>
        <p className="text-2xl leading-relaxed text-white">
          MangaDex was created in January 2018 by the former admin and sole
          developer, Hologfx. Since then, MangaDex has been steadily growing,
          approaching 14 million unique visitors per month. The site is
          currently ran by 21+ unpaid volunteers.
        </p>
      </div>

      {/* Contact Information */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <p className="text-2xl leading-relaxed text-white">
          The fastest way to contact us is on our{" "}
          <a
            href="https://discord.gg/mangadex"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 underline hover:text-orange-400"
          >
            Discord server
          </a>
          .
        </p>
      </div>

      {/* Warning/Information Box */}
      <div className="mb-6 rounded-lg border border-neutral-700 bg-neutral-800 p-4 sm:mb-8 sm:p-5 md:mb-10 md:p-6">
        <p className="text-2xl leading-relaxed text-white">
          If someone contacts you on Discord claiming to be MangaDex staff,
          verify that their account id matches. Our staff members will{" "}
          <strong>NEVER</strong> ask for your{" "}
          <strong>password or for money</strong>. No exceptions.
        </p>
      </div>

      {/* Funding Information */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <p className="text-2xl leading-relaxed text-white">
          We fund our servers primarily through our affiliate programs and
          private support. Our affiliates are generally services that have
          helped us out tremendously or that we use ourselves. We may run
          non-intrusive ads as a last resort when our other funding options
          fail, but for the most part we'd like to keep it this way out of our
          personal distaste for ads.
        </p>
      </div>
    </div>
  );
}
