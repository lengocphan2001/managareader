import { ReadListResponse } from "@/types";
import { axios } from "./axios";

export const getReadList = async (query: { page?: number } = {}) => {
  const { data } = await axios<ReadListResponse>({
    url: "/api/user/read-list",
    params: { ...query },
  });
  return data;
};

export const updateLibraryStatus = async (
  series_uuid: string,
  status: string | null,
) => {
  const { data } = await axios({
    method: "POST",
    url: "/api/user/library/update-status",
    data: {
      series_uuid,
      status,
    },
  });
  return data;
};

export const getLibraryStatus = async (series_uuid: string) => {
  const { data } = await axios<{ success: boolean; status: string | null }>({
    url: `/api/user/library/status/${series_uuid}`,
  });
  return data;
};

export const getLibrary = async (
  query: { status?: string; page?: number; limit?: number } = {},
) => {
  const { data } = await axios<{
    success: boolean;
    data: string[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  }>({
    url: "/api/user/library",
    params: { ...query },
  });
  return data;
};

export const getFollows = async (query: { page?: number } = {}) => {
  const { data } = await axios<ReadListResponse>({
    url: "/api/user/follows",
    params: { ...query },
  });
  return data;
};

export const syncReadList = async (body: { source: string; ids: string[] }) => {
  const { data } = await axios({
    url: "/api/user/read-list/sync",
    method: "POST",
    data: body,
  });

  return data;
};

export const changePassword = async (body: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) => {
  const { data } = await axios({
    url: "/api/user/change-password",
    method: "POST",
    data: body,
  });

  return data;
};

export const changeName = async (body: { name: string }) => {
  const { data } = await axios({
    url: "/api/user/change-name",
    method: "POST",
    data: body,
  });

  return data;
};

export const changeAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await axios({
    url: "/api/user/change-avatar",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
