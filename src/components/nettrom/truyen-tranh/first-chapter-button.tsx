"use client";

import { useCallback, useState } from "react";
import { useRouter } from "nextjs-toploader/app";

import { Button } from "../Button";
import { MangadexApi } from "@/api";
import { toast } from "react-toastify";
import { Constants } from "@/constants";
import Iconify from "@/components/iconify";

export default function FirstChapterButton({ mangaId }: { mangaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const readFirstChapter = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await MangadexApi.Manga.getMangaIdAggregate(mangaId, {
        // Don't filter by language - get all available chapters
      });
      const firstChapterId = Object.values(
        Object.values(data.volumes)[0].chapters,
      )[0].id;
      setLoading(false);
      router.push(Constants.Routes.nettrom.chapter(firstChapterId));
    } catch {
      toast("This manga has no first chapter", { type: "error" });
    }
  }, [mangaId]);
  return (
    <Button
      onClick={readFirstChapter}
      variant="outline"
      className="whitespace-nowrap border-white/20 text-white hover:bg-white/10"
      icon={
        loading ? <Iconify icon="uil:spinner" /> : <Iconify icon="fa:book" />
      }
      disabled={loading}
    >
      Start Reading
    </Button>
  );
}
