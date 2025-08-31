import { SettingsState } from "@/types";

export class SettingsConstants {
  readonly COOKIE_KEY = "truyendex-settings";
  readonly DEFAULT_SETTINGS: SettingsState = {
    filteredLanguages: ["en", "ja-ro"],
    originLanguages: [],
    filteredContent: ["safe", "suggestive", "erotica"],
    dataSaver: false,
    maxImageWidth: undefined,
  };
}
