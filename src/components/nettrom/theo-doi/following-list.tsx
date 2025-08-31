"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useReadList } from "@/hooks/core";
import { AppApi, MangadexApi } from "@/api";
import { useMangadex } from "@/contexts/mangadex";
import Iconify from "@/components/iconify";
import { Utils } from "@/utils";
import { DataLoader } from "@/components/DataLoader";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import ConfirmModal from "@/components/shadcn/confirm-modal";

import Pagination from "../Pagination";
import MangaTile from "../manga-tile";
import { Button } from "../Button";

export default function FollowingList() {
  const { updateMangas, updateMangaStatistics, mangaStatistics, mangas } =
    useMangadex();
  const [page, setPage] = useState(1);
  const { data, mutate, isLoading, error } = useReadList(page);
  const { modalState, showConfirm, hideConfirm, handleConfirm } =
    useConfirmModal();

  const unfollow = useCallback(
    async (mangaId: string) => {
      showConfirm(
        "Unfollow Manga",
        "Are you sure you want to unfollow this manga?",
        async () => {
          const { followed } = await AppApi.Series.followOrUnfollow(mangaId);
          toast(followed ? "Followed successfully" : "Unfollowed successfully");
          await mutate();
        },
        {
          confirmText: "Unfollow",
          cancelText: "Cancel",
          type: "danger",
        },
      );
    },
    [mutate, showConfirm],
  );

  useEffect(() => {
    if (!data) return;
    const ids = data.data.map((d) => d.series_uuid);
    updateMangas({ ids, includes: [MangadexApi.Static.Includes.COVER_ART] });
    updateMangaStatistics({ manga: ids });
  }, [data, updateMangaStatistics, updateMangas]);

  return (
    <div>
      <div className="items">
        <div className="row">
          <DataLoader
            loadingText="Loading your followed manga list..."
            isLoading={isLoading}
            error={error}
          >
            <div className="grid grid-cols-2 gap-[20px] lg:grid-cols-4">
              {data?.data.map(
                ({
                  series_uuid,
                  latest_chapter_uuid,
                  title,
                  chapter_updated_at,
                  chapter_title,
                }) => {
                  const manga = mangas[series_uuid];

                  return (
                    <div key={series_uuid}>
                      <MangaTile
                        id={series_uuid}
                        thumbnail={Utils.Mangadex.getCoverArt(manga)}
                        title={title}
                        key={series_uuid}
                        mangaStatistic={mangaStatistics[series_uuid]}
                        chapters={[
                          {
                            id: latest_chapter_uuid,
                            title: chapter_title,
                            subTitle: Utils.Date.formatNowDistance(
                              new Date(chapter_updated_at),
                            ),
                          },
                        ]}
                      />
                      <Button
                        onClick={() => unfollow(series_uuid)}
                        icon={<Iconify icon="fa:times-circle" />}
                        className="mt-2 w-full"
                      >
                        Unfollow
                      </Button>
                    </div>
                  );
                },
              )}
              {
                // Show empty state if no manga
                !data?.data.length && (
                  <div className="col-span-4 text-center">
                    <p>You haven't followed any manga yet</p>
                  </div>
                )
              }
            </div>
          </DataLoader>
        </div>
      </div>
      {data && (
        <div className="pagination-container pagination-outter">
          <Pagination
            onPageChange={(event) => {
              setPage(event.selected + 1);
            }}
            pageCount={data.last_page}
            forcePage={page - 1}
          />
        </div>
      )}

      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={hideConfirm}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
      />
    </div>
  );
}
