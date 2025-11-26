"use client";

import Link from "next/link";
import { Constants } from "@/constants";
import { FaArrowLeft } from "react-icons/fa";

export default function ContactPageClient() {
  return (
    <div className="w-full">
      {/* Header with back arrow */}
      <div className="p-5 mb-6 sm:mb-8 md:mb-10">
        <Link
          href={Constants.Routes.nettrom.index}
          className="inline-flex items-center gap-3 sm:gap-4 text-white text-4xl sm:text-5xl md:text-6xl font-semibold no-underline hover:no-underline"
        >
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors">
            <FaArrowLeft className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </div>
          <span>Contact</span>
        </Link>
      </div>

      {/* Introduction */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <p className="text-2xl text-white leading-relaxed">
          MangaDex is a popular website, with a global community spread around the world, all maintained by a relatively small team. To ensure a timely response, please pick the most accurate contact reason.
        </p>
      </div>

      {/* Support Section */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-5 md:mb-6">
          Support
        </h2>
        <div className="space-y-3 sm:space-y-4 text-2xl text-white leading-relaxed">
          <p>
            The best way to get support is our community Discord server:{" "}
            <a
              href="https://discord.gg/mangadex"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-400 underline"
            >
              https://discord.gg/mangadex
            </a>
          </p>
          <p>
            If you are unable to use Discord, you can alternatively write to{" "}
            <a
              href="mailto:support@mangadex.org"
              className="text-orange-500 hover:text-orange-400 underline"
            >
              support@mangadex.org
            </a>
          </p>
          <p className="text-gray-400">
            Please note that contacting us by email for support inquiries is significantly slower.
          </p>
        </div>
      </div>

      {/* Partnerships Section */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-5 md:mb-6">
          Partnerships
        </h2>
        <div className="space-y-3 sm:space-y-4 text-2xl text-white leading-relaxed">
          <p>
            While selective about the third parties we partner with, we do occasionally work with others if it benefits our community.
          </p>
          <p>
            If you are representing an ad network, or inquiring about sponsored content placement (e.g.: "blog articles" and the likes), please do not contact us.
          </p>
        </div>
      </div>

      {/* Abusive Content & Compliance Section */}
      <div className="mb-8 sm:mb-10 md:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-5 md:mb-6">
          Abusive Content & Compliance
        </h2>
        <div className="space-y-3 sm:space-y-4 text-2xl text-white leading-relaxed">
          <p>
            MangaDex takes abuse reports and compliance requests seriously. Click the relevant category for their detailed policy and contact method:
          </p>
          <ul className="list-disc list-inside space-y-2 sm:space-y-3 ml-4 sm:ml-6">
            <li>
              <a
                href="#"
                className="text-orange-500 hover:text-orange-400 underline"
              >
                Copyright Infringement & DMCA Policy
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-orange-500 hover:text-orange-400 underline"
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

