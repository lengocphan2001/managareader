import { MangadexApi } from "@/api";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";

export class ErrorHandlerUtils {
  handleError = (error: any, message?: string) => {
    console.error(error);
    if (isAxiosError(error) && error.status === 409) {
      toast.error("Please verify your email before using this feature");
      return;
    }
    if (message) {
      toast.error(message);
      return;
    }
    message = "An error occurred";
    if (isAxiosError(error)) {
      message = error.response?.data.message || error.message;
    }
    if (error instanceof MangadexApi.Utils.MangaDexError) {
      if (error.status === 429) {
        message = `Gửi quá nhiều yêu cầu đến MangaDex, vui lòng thử lại sau ${error.response?.headers["retry-after"] || 60} giây`;
      } else message = "An error occurred while loading data from MangaDex";
    }
    if (typeof error === "string") {
      message = error;
    }
    toast.error(message);
  };
}
