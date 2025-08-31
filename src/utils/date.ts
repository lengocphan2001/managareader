import { format, formatDistance as dateFnsFormatDistance } from "date-fns";
import en from "date-fns/locale/en-US";

export class DateUtils {
  formatNowDistance(
    date: Date | number,
    options?: {
      addSuffix?: boolean;
      unit?: "second" | "minute" | "hour" | "day" | "month" | "year";
      roundingMethod?: "floor" | "ceil" | "round";
      locale?: Locale;
    },
  ): string {
    return dateFnsFormatDistance(date, new Date(), { locale: en, ...options });
  }

  formatDateTime(date: Date | number, options?: { locale?: Locale }) {
    return format(date, "dd/MM/yyyy HH:mm", options);
  }
}
