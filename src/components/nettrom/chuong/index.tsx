"use client";

import ChapterReaderLayout from "./chapter-reader-layout";
import OptimisticChapterView from "./optimistic-chapter-view";

export default function ChapterView() {
  return (
    <OptimisticChapterView>
      <ChapterReaderLayout />
    </OptimisticChapterView>
  );
}
