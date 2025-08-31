"use client";

import { MouseEvent, useCallback } from "react";

import { Button } from "./Button";
import MultiSelectDropdown from "./multiselect-dropdown";
import Iconify from "../iconify";
import { Slider } from "../shadcn/slider";
import { Switch } from "../shadcn/switch";
import { useSettingsContext } from "@/contexts/settings";
import useWindowSize from "@/hooks/useWindowSize";

export default function SettingsDialog() {
  const {
    openDrawer,
    onCloseDrawer,
    filteredLanguages,
    filteredContent,
    originLanguages,
    dataSaver,
    maxImageWidth,
    onUpdateField,
    onReset,
    onUpdate,
  } = useSettingsContext();

  const { width: windowWidth } = useWindowSize();

  const handleBackdropClick = useCallback(
    (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.id === "settings-backdrop") {
        onCloseDrawer();
      }
    },
    [onCloseDrawer],
  );

  if (!openDrawer) return null;

  return (
    <div
      id="settings-backdrop"
      className="fixed inset-0 z-10 flex items-center justify-center bg-neutral-950 bg-opacity-90 text-white"
      onClick={handleBackdropClick}
    >
      <div className="max-w-lg space-y-4 rounded border bg-neutral-900 p-12 shadow">
        <div className="font-bold">Settings</div>
        <div>These settings are saved on your current device.</div>
        <div className="font-bold">Translation Language:</div>
        <div className="flex items-center justify-between">
          <div>English</div>
          <Switch
            checked={filteredLanguages.includes("en")}
            onCheckedChange={(value) =>
              onUpdateField(
                "filteredLanguages",
                value ? ["en", "ja-ro"] : ["en", "ja-ro"],
              )
            }
          />
        </div>
        <div className="font-bold">Image Quality:</div>
        <div className="flex items-center justify-between">
          <div>High Quality</div>
          <Switch
            checked={dataSaver}
            onCheckedChange={(value) => onUpdateField("dataSaver", value)}
          />
        </div>
        <div className="font-bold">Manga Countries:</div>
        <MultiSelectDropdown
          options={[
            { label: "Japanese (manga)", value: "ja" },
            { label: "Korean (manhwa)", value: "ko" },
            { label: "Chinese (manhua)", value: "zh" },
            { label: "Vietnamese", value: "vi" },
          ]}
          selectedValues={originLanguages}
          onChange={(values) => onUpdateField("originLanguages", values)}
          anyLabel="All Countries"
          language
        />
        <div className="font-bold">Content Filter:</div>
        <MultiSelectDropdown
          options={[
            { label: "Safe", value: "safe" },
            { label: "Suggestive", value: "suggestive" },
            { label: "Erotica", value: "erotica" },
            { label: "Pornographic", value: "pornographic" },
          ]}
          selectedValues={filteredContent}
          onChange={(values) => onUpdateField("filteredContent", values)}
          anyLabel="All Content"
        />
        <div className="flex items-center gap-2">
          <Switch
            checked={maxImageWidth !== undefined}
            onCheckedChange={(value) =>
              onUpdateField("maxImageWidth", value ? 0 : undefined)
            }
          />
          <div className="font-bold">Image Width</div>
          {maxImageWidth !== undefined && (
            <span className="font-normal text-muted-foreground">
              {"(" + maxImageWidth + "px)"}
            </span>
          )}
        </div>
        {maxImageWidth !== undefined && (
          <Slider
            min={0}
            max={windowWidth || 0}
            value={
              maxImageWidth ? [maxImageWidth] : [(windowWidth || 0) * 0.8 || 0]
            }
            onValueChange={(value) =>
              onUpdateField("maxImageWidth", value[0] || 0)
            }
          />
        )}
        <div className="flex justify-end gap-4">
          <Button
            onClick={() => {
              onCloseDrawer();
              onUpdate({
                filteredContent,
                filteredLanguages,
                dataSaver,
                originLanguages,
              });
            }}
          >
            Save
          </Button>
          <Button icon={<Iconify icon="fa:refresh" />} onClick={onReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
