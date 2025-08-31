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
        // Use the same domain with /api path for production
        return `${window.location.protocol}//${window.location.hostname}/api`;
      }
    }
    // For localhost development, use backend server
    return Constants.BACKEND_URL || "http://localhost:8000/api";
  }

  getGoogleAuthUrl() {
    return this.getBackendUrl() + "/sso/google/redirect";
  }

  getAvatarUrl(avatarPath?: string | null) {
    if (!avatarPath) return "/nettruyen/images/default-avatar.jpg";
    return `${Constants.APP_IMAGE_URL}/${avatarPath}`;
  }
}
