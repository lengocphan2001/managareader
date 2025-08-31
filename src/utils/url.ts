import { MangadexApi } from "@/api";
import { Constants } from "@/constants";

const IMAGE_RESIZE_URL = "https://resizer.f-ck.me";

export class UrlUtils {
  getSearchNetTromUrl(options: MangadexApi.Manga.GetSearchMangaRequestOptions) {
    const queryString = MangadexApi.Utils.buildQueryStringFromOptions(options);
    return `${Constants.Routes.nettrom.search}${queryString.replaceAll("[]", "")}#results`;
  }

  getResizeImgUrl(url: string, queryParams?: string) {
    return `${IMAGE_RESIZE_URL}/?url=${url}&${queryParams ?? ""}`;
  }

  getBackendUrl() {
    if (typeof window !== "undefined") {
      if (window.location.hostname !== "localhost") {
        // Use the same domain without /api path for production (since URLs already include /api)
        return `${window.location.protocol}//${window.location.hostname}`;
      }
    }
    // For localhost development, use backend server without /api
    return (
      Constants.BACKEND_URL?.replace("/api", "") || "http://localhost:8000"
    );
  }

  getGoogleAuthUrl() {
    return this.getBackendUrl() + "/sso/google/redirect";
  }

  getAvatarUrl(avatarPath?: string | null) {
    if (!avatarPath) return "/nettruyen/images/default-avatar.jpg";
    return `${Constants.APP_IMAGE_URL}/${avatarPath}`;
  }
}
