"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, Suspense } from "react";
import { twMerge } from "tailwind-merge";
import { FaArrowDown, FaArrowUp, FaRedo, FaSearch, FaList, FaTh, FaThLarge, FaMinus, FaPlus } from "react-icons/fa";

import { MangadexApi } from "@/api";
import { Utils } from "@/utils";
import { useToggle } from "@/hooks/useToggle";
import { Constants } from "@/constants";
import { useDisplayMode } from "@/contexts/display-mode";

import MultiSelectDropdown from "../multiselect-dropdown";
import { Button } from "../Button";

import FilterTag from "./filter-tag";
import Input from "../input";
import AuthorSearchInput from "./author-search-input";

type Inputs = MangadexApi.Manga.GetSearchMangaRequestOptions & {
  orderType?: string;
};

const optionlize = (
  t: string,
  parser: (t: string) => string = (t) => t.toUpperCase(),
) => ({ value: t, label: parser(t) });

function SearchMangaFormContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [showFilter, toggle] = useToggle(false); // Default to false to hide filters
  const { displayMode, setDisplayMode } = useDisplayMode();

  const { register, handleSubmit, watch, reset, setValue } = useForm<Inputs>({
    defaultValues: {
      originalLanguage: ["en"],
      availableTranslatedLanguage: ["en", "ja-ro"],
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    // Always include default values
    const searchData = {
      ...data,
      originalLanguage: data.originalLanguage && data.originalLanguage.length > 0 
        ? data.originalLanguage 
        : ["en"],
      availableTranslatedLanguage: data.availableTranslatedLanguage && data.availableTranslatedLanguage.length > 0
        ? data.availableTranslatedLanguage
        : ["en", "ja-ro"],
    };
    router.push(Utils.Url.getSearchNetTromUrl(searchData));
  };
  const values = watch();

  useEffect(() => {
    const normalizedParams: Inputs = Utils.Mangadex.normalizeParams(params);
    if (!params.get("orderType") && normalizedParams.order) {
      if (
        normalizedParams.order.latestUploadedChapter ===
        MangadexApi.Static.Order.DESC
      )
        normalizedParams.orderType = "0";
      else if (
        normalizedParams.order.createdAt === MangadexApi.Static.Order.DESC
      )
        normalizedParams.orderType = "1";
      else if (
        normalizedParams.order.followedCount === MangadexApi.Static.Order.DESC
      )
        normalizedParams.orderType = "2";
      else if (normalizedParams.order.title === MangadexApi.Static.Order.ASC)
        normalizedParams.orderType = "3";
      else if (
        normalizedParams.order.relevance === MangadexApi.Static.Order.DESC
      )
        normalizedParams.orderType = "4";
      else if (normalizedParams.order.rating === MangadexApi.Static.Order.DESC)
        normalizedParams.orderType = "5";
    }
    // Set default values if not in params
    if (!normalizedParams.originalLanguage || normalizedParams.originalLanguage.length === 0) {
      normalizedParams.originalLanguage = ["en"];
    }
    if (!normalizedParams.availableTranslatedLanguage || normalizedParams.availableTranslatedLanguage.length === 0) {
      normalizedParams.availableTranslatedLanguage = ["en", "ja-ro"];
    }
    reset({ ...normalizedParams });
  }, [params, reset]);

  useEffect(() => {
    const orderType = values.orderType;
    switch (orderType) {
      case "0":
        setValue("order", {
          latestUploadedChapter: MangadexApi.Static.Order.DESC,
        });
        break;
      case "1":
        setValue("order", { createdAt: MangadexApi.Static.Order.DESC });
        break;
      case "2":
        setValue("order", { followedCount: MangadexApi.Static.Order.DESC });
        break;
      case "3":
        setValue("order", { title: MangadexApi.Static.Order.ASC });
        break;
      case "4":
        setValue("order", { relevance: MangadexApi.Static.Order.DESC });
        break;
      case "5":
        setValue("order", { rating: MangadexApi.Static.Order.DESC });
        break;
      default:
        break;
    }
  }, [values.orderType, setValue]);

  const currentYearValue = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYearValue - i).map(
    (year) => ({ value: year.toString(), label: year.toString() })
  );

  return (
    <>
      <form className="mb-8" onSubmit={handleSubmit(onSubmit)}>
        {/* Search Bar and Filter Toggle */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <Input
              type="search"
              id="default-search"
              placeholder="Search"
              icon={<FaSearch className="h-6 w-6" />}
              {...register("title")}
              className="bg-neutral-800 border-neutral-700 text-white text-xl placeholder-neutral-500 h-16"
            />
          </div>
          <Button
            className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xl px-8 h-16"
            type="button"
            onClick={toggle}
            icon={showFilter ? <FaArrowUp className="h-5 w-5" /> : <FaArrowDown className="h-5 w-5" />}
          >
            {showFilter ? "Hide filters" : "Show filters"}
          </Button>
        </div>

        {/* Filters - 2 Rows Layout */}
        <div
          className={twMerge(
            "transition-[max-height] duration-300 ease-in-out mb-6",
            showFilter ? "max-h-[2000px]" : "max-h-0 overflow-hidden",
          )}
        >
          {/* First Row */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className="block text-white text-lg font-medium mb-2">
                Sort by
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-lg border-2 border-neutral-600 bg-neutral-800 px-4 py-3 pr-10 text-lg text-white focus:border-orange-500 focus:outline-none focus:ring-0"
                  {...register("orderType")}
                >
                  <option value="">None</option>
                  {Object.entries(ORDER_TYPE).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white text-lg font-medium mb-2">
                Filter tags
              </label>
              <FilterTag values={values} setValue={setValue} />
            </div>

            <div>
              <label className="block text-white text-lg font-medium mb-2">
                Content Rating
              </label>
              <MultiSelectDropdown
                options={Object.values(
                  MangadexApi.Static.MangaContentRating,
                ).map((v) =>
                  optionlize(v, Utils.Mangadex.translateContentRating),
                )}
                selectedValues={values.contentRating || []}
                onChange={(newValue) => {
                  setValue(
                    "contentRating",
                    newValue as MangadexApi.Static.MangaContentRating[],
                  );
                }}
                anyLabel="Any"
              />
            </div>

            <div>
              <label className="block text-white text-lg font-medium mb-2">
                Magazine Demographic
              </label>
              <MultiSelectDropdown
                options={Object.values(
                  MangadexApi.Static.MangaPublicationDemographic,
                ).map((v) => optionlize(v))}
                selectedValues={values.publicationDemographic || []}
                onChange={(newValue) => {
                  setValue(
                    "publicationDemographic",
                    newValue as MangadexApi.Static.MangaPublicationDemographic[],
                  );
                }}
                anyLabel="Any"
              />
            </div>

            <div>
              <label className="block text-white text-lg font-medium mb-2">
                Authors
              </label>
              <AuthorSearchInput
                type="author"
                values={values}
                setValue={setValue}
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className="block text-white text-lg font-medium mb-2">
                Artists
              </label>
              <AuthorSearchInput
                type="artist"
                values={values}
                setValue={setValue}
              />
            </div>

            <div>
              <label className="block text-white text-lg font-medium mb-2">
                Original languages
              </label>
              <MultiSelectDropdown
                options={Constants.Nettrom.languages.map((v) => ({
                  value: v.code,
                  label: v.name,
                }))}
                selectedValues={values.originalLanguage || []}
                onChange={(newValue) => {
                  setValue("originalLanguage", newValue);
                }}
                language
                anyLabel="All languages"
              />
            </div>

            <div>
              <label className="block text-white text-lg font-medium mb-2">
                Publication year
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-neutral-600 bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
                  onClick={() => {
                    const yearValue = values.year ? parseInt(values.year.toString()) : currentYearValue;
                    if (yearValue > 1900) {
                      setValue("year", (yearValue - 1).toString());
                    }
                  }}
                >
                  <FaMinus className="h-4 w-4" />
                </button>
                <div className="relative flex-1">
                  <select
                    className="w-full appearance-none rounded-lg border-2 border-neutral-600 bg-neutral-800 px-4 py-3 pr-10 text-lg text-white focus:border-orange-500 focus:outline-none focus:ring-0"
                    {...register("year")}
                  >
                    <option value="">Any</option>
                    {yearOptions.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-neutral-600 bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
                  onClick={() => {
                    const yearValue = values.year ? parseInt(values.year.toString()) : currentYearValue;
                    if (yearValue < currentYearValue) {
                      setValue("year", (yearValue + 1).toString());
                    }
                  }}
                >
                  <FaPlus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white text-lg font-medium mb-2">
                Publication Status
              </label>
              <MultiSelectDropdown
                options={Object.values(
                  MangadexApi.Static.MangaPublicationStatus,
                ).map((v) => optionlize(v, Utils.Mangadex.translateStatus))}
                selectedValues={values.status || []}
                onChange={(newValue) => {
                  setValue(
                    "status",
                    newValue as MangadexApi.Static.MangaPublicationStatus[],
                  );
                }}
                anyLabel="Any"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons and Display Mode */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            <Button
              className="rounded-lg bg-transparent text-red-500 hover:bg-neutral-800 border border-transparent hover:border-red-500 text-xl px-8 h-14"
              type="button"
              onClick={() => {
                reset();
              }}
            >
              Reset filters
            </Button>
            <Button
              className="rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-xl px-8 h-14"
              type="button"
              onClick={() => {
                const randomOptions = { random: true };
                router.push(Utils.Url.getSearchNetTromUrl(randomOptions));
              }}
            >
              I'm feeling lucky
            </Button>
            <Button
              icon={<FaSearch className="h-6 w-6" />}
              className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xl px-8 h-14"
              type="submit"
            >
              Search
            </Button>
          </div>
          {/* Display Mode Icons */}
          <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setDisplayMode("list")}
              className={twMerge(
                "p-4 rounded transition-colors",
                displayMode === "list"
                  ? "bg-orange-500 text-white"
                  : "text-white hover:bg-neutral-700"
              )}
              title="List view"
              aria-label="List view"
            >
              <FaList className="h-8 w-8" />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("compact-grid")}
              className={twMerge(
                "p-4 rounded transition-colors",
                displayMode === "compact-grid"
                  ? "bg-orange-500 text-white"
                  : "text-white hover:bg-neutral-700"
              )}
              title="Compact grid view"
              aria-label="Compact grid view"
            >
              <FaTh className="h-8 w-8" />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("large-grid")}
              className={twMerge(
                "p-4 rounded transition-colors",
                displayMode === "large-grid"
                  ? "bg-orange-500 text-white"
                  : "text-white hover:bg-neutral-700"
              )}
              title="Large grid view"
              aria-label="Large grid view"
            >
              <FaThLarge className="h-8 w-8" />
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default function SearchMangaForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchMangaFormContent />
    </Suspense>
  );
}

const ORDER_TYPE: Record<string, string> = {
  "0": "latest updates",
  "1": "new manga",
  "2": "most followed",
  "3": "alphabetical",
  "4": "most relevant",
  "5": "highest rated",
};

