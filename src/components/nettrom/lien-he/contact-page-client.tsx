"use client";

import Link from "next/link";
import { Constants } from "@/constants";
import { FaArrowLeft } from "react-icons/fa";

export default function ContactPageClient() {
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
          <span>Contact</span>
        </Link>
      </div>

      {/* Introduction */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <p className="text-2xl leading-relaxed text-white">
          MangaDex is a popular website, with a global community spread around
          the world, all maintained by a relatively small team. To ensure a
          timely response, please pick the most accurate contact reason.
        </p>
      </div>

      {/* Support Section */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <h2 className="mb-4 text-2xl font-bold text-white sm:mb-5 sm:text-3xl md:mb-6 md:text-4xl">
          Support
        </h2>
        <div className="space-y-3 text-2xl leading-relaxed text-white sm:space-y-4">
          <p>
            The best way to get support is our community Discord server:{" "}
            <a
              href="https://discord.gg/mangadex"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 underline hover:text-orange-400"
            >
              https://discord.gg/mangadex
            </a>
          </p>
          <p>
            If you are unable to use Discord, you can alternatively write to{" "}
            <a
              href="mailto:support@mangadex.org"
              className="text-orange-500 underline hover:text-orange-400"
            >
              support@mangadex.org
            </a>
          </p>
          <p className="text-gray-400">
            Please note that contacting us by email for support inquiries is
            significantly slower.
          </p>
        </div>
      </div>

      {/* Partnerships Section */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <h2 className="mb-4 text-2xl font-bold text-white sm:mb-5 sm:text-3xl md:mb-6 md:text-4xl">
          Partnerships
        </h2>
        <div className="space-y-3 text-2xl leading-relaxed text-white sm:space-y-4">
          <p>
            While selective about the third parties we partner with, we do
            occasionally work with others if it benefits our community.
          </p>
          <p>
            If you are representing an ad network, or inquiring about sponsored
            content placement (e.g.: "blog articles" and the likes), please do
            not contact us.
          </p>
        </div>
      </div>

      {/* Abusive Content & Compliance Section */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <h2 className="mb-4 text-2xl font-bold text-white sm:mb-5 sm:text-3xl md:mb-6 md:text-4xl">
          Abusive Content & Compliance
        </h2>
        <div className="space-y-3 text-2xl leading-relaxed text-white sm:space-y-4">
          <p>
            MangaDex takes abuse reports and compliance requests seriously.
            Click the relevant category for their detailed policy and contact
            method:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-2 sm:ml-6 sm:space-y-3">
            <li>
              <a
                href="#"
                className="text-orange-500 underline hover:text-orange-400"
              >
                Copyright Infringement & DMCA Policy
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-orange-500 underline hover:text-orange-400"
              >
                Personal data protection & GDPR related requests
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
