import { Suspense } from "react";
import dynamic from "next/dynamic";
import PopularNewTitles from "@/components/nettrom/trang-chu/popular-new-titles";
import LatestUpdatesGrid from "@/components/nettrom/trang-chu/latest-updates-grid";
import Skeleton from "react-loading-skeleton";

// Lazy load các slider components
const RecommendedSlider = dynamic(
  () => import("@/components/nettrom/trang-chu/recommended-slider"),
  { ssr: false },
);
const SelfPublishedSlider = dynamic(
  () => import("@/components/nettrom/trang-chu/self-published-slider"),
  { ssr: false },
);
const FeaturedSlider = dynamic(
  () => import("@/components/nettrom/trang-chu/featured-slider"),
  { ssr: false },
);
const RecentlyAddedSlider = dynamic(
  () => import("@/components/nettrom/trang-chu/recently-added-slider"),
  { ssr: false },
);

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Suspense fallback={<Skeleton height={600} />}>
        <PopularNewTitles />
      </Suspense>
      <div className="mt-8">
        <Suspense fallback={<Skeleton height={400} />}>
          <LatestUpdatesGrid />
        </Suspense>
      </div>
      <div className="mt-8">
        <Suspense fallback={<Skeleton height={300} />}>
          <RecommendedSlider />
        </Suspense>
      </div>
      <div className="mt-8">
        <Suspense fallback={<Skeleton height={300} />}>
          <SelfPublishedSlider />
        </Suspense>
      </div>
      <div className="mt-8">
        <Suspense fallback={<Skeleton height={300} />}>
          <FeaturedSlider />
        </Suspense>
      </div>
      <div className="mt-8">
        <Suspense fallback={<Skeleton height={300} />}>
          <RecentlyAddedSlider />
        </Suspense>
      </div>
    </div>
  );
}
