"use client";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

import { Constants } from "@/constants";
import { useAuth } from "@/hooks/useAuth";

import FollowingList from "./following-list";

function FollowingViewContent() {
  const params = useSearchParams();
  const [tab, setTab] = useState<"following" | "sync">(
    params.get("tab") === "sync" ? "sync" : "following",
  );

  return (
    <div>
      <div id="follow-content-section" className="center-side col-md-8">
        <div className="comics-followed-page Module Module-178">
          <div className="mrt15">
            <ul
              className="comment-nav text-center"
              style={{ fontSize: 16, marginBottom: 15 }}
            >
              <li
                className={tab === "following" ? "active" : ""}
                onClick={() => setTab("following")}
              >
                <a>Following</a>
              </li>
            </ul>
          </div>
          {tab === "following" && <FollowingList />}
        </div>
      </div>
    </div>
  );
}

export default function FollowingView() {
  useAuth({
    middleware: "auth",
    redirectIfNotAuthenticated: Constants.Routes.loginWithRedirect(
      Constants.Routes.nettrom.following,
    ),
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FollowingViewContent />
    </Suspense>
  );
}