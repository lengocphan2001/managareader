"use client";

import useSWR from "swr/immutable";
import { useMemo } from "react";
import { MangadexApi } from "@/api";
import { ScanlationGroup, ScanlationGroupList } from "@/types/mangadex";
import { Utils } from "@/utils";

export default function useSearchGroup(
  options: MangadexApi.Group.GetSearchGroupRequestOptions,
  { enable }: { enable: boolean } = { enable: true },
) {
  // avoid invalid vietnamese characters
  if (options.name) {
    options.name = encodeURIComponent(options.name);
  }
  if (!options.includes) {
    options.includes = [MangadexApi.Static.Includes.LEADER];
  } else if (!options.includes.includes(MangadexApi.Static.Includes.LEADER)) {
    options.includes.push(MangadexApi.Static.Includes.LEADER);
  }
  const { data, error, isLoading, mutate } = useSWR(
    enable ? ["search-group", options] : null,
    () => MangadexApi.Group.getSearchGroup(options),
    {},
  );
  const successData =
    data && data.data.result === "ok" && (data.data as ScanlationGroupList);

  const groupList = useMemo(() => {
    if (successData) return successData.data;
    return [];
  }, [successData]);

  return { data: successData, error, isLoading, groupList, mutate };
}

