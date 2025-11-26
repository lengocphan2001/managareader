"use client";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

import { Constants } from "@/constants";
import { useAuth } from "@/hooks/useAuth";
import AuthRequired from "../auth-required";

import FollowingList from "./following-list";
import UpdatesList from "./updates-list";

function FollowingViewContent() {
  const params = useSearchParams();
  const [tab, setTab] = useState<
    "following" | "sync" | "library" | "lists" | "groups"
  >((params.get("tab") as any) || "following");

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
          <span>Updates</span>
        </Link>
      </div>

      {tab === "following" && <UpdatesList />}
      {tab !== "following" && <FollowingList />}
    </div>
  );
}

function FollowingViewWithAuth() {
  const params = useSearchParams();
  const { user } = useAuth();
  const tab = params.get("tab");

  if (!user) {
    let title = "Updates";

    if (tab === "library") title = "Library";
    else if (tab === "lists") title = "MDLists";
    else if (tab === "groups") title = "My Groups";
    else title = "Updates";

    return <AuthRequired title={title} />;
  }

  return <FollowingViewContent />;
}

export default function FollowingView() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FollowingViewWithAuth />
    </Suspense>
  );
}
