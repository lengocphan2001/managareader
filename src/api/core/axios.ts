import { Constants } from "@/constants";
import { Utils } from "@/utils";
import Axios from "axios";

const axios = Axios.create({
  baseURL: "", // Will be set dynamically
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axios.interceptors.request.use(
  (config) => {
    // Dynamically set the baseURL before each request
    config.baseURL = Utils.Url.getBackendUrl();

    // Add Authorization header if token exists
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export { axios };
