import { SeriesHomepageResponse } from "@/types";
import { axios } from "./axios";

export const followOrUnfollow = async (seriesId: string) => {
  const { data } = await axios({
    method: "POST",
    url: "/series/follow",
    data: {
      series_uuid: seriesId,
    },
  });
  return data;
};

export const checkInfo = async (seriesId: string) => {
  const { data } = await axios<{
    followed: boolean | null;
    comment_count: number;
  }>({
    method: "POST",
    url: "/series/check-info",
    data: {
      series_uuid: seriesId,
    },
  });
  return data;
};

export const getHomepageSeries = async (params: {
  limit: number;
  page?: number;
}) => {
  const { data } = await axios<SeriesHomepageResponse>({
    method: "GET",
    url: "/series/homepage",
    params,
  });
  return data;
};
