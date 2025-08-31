import { ReadListResponse } from "@/types";
import { axios } from "./axios";

export const getReadList = async (query: { page?: number } = {}) => {
  const { data } = await axios<ReadListResponse>({
    url: "/user/read-list",
    params: { ...query },
  });
  return data;
};

export const getFollows = async (query: { page?: number } = {}) => {
  const { data } = await axios<ReadListResponse>({
    url: "/user/follows",
    params: { ...query },
  });
  return data;
};

export const syncReadList = async (body: { source: string; ids: string[] }) => {
  const { data } = await axios({
    url: "/user/read-list/sync",
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
    url: "/user/change-password",
    method: "POST",
    data: body,
  });

  return data;
};

export const changeName = async (body: { name: string }) => {
  const { data } = await axios({
    url: "/user/change-name",
    method: "POST",
    data: body,
  });

  return data;
};

export const changeAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await axios({
    url: "/user/change-avatar",
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
