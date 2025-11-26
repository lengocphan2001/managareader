"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../Button";
import { ExtendManga } from "@/types/mangadex";
import { Utils } from "@/utils";
import { AppApi } from "@/api";
import Iconify from "@/components/iconify";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-toastify";

interface AddToLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  manga: ExtendManga;
  mangaId: string;
  onSuccess?: () => void;
}

const READING_STATUS_OPTIONS = [
  { value: null, label: "None" },
  { value: "reading", label: "Reading" },
  { value: "on_hold", label: "On Hold" },
  { value: "dropped", label: "Dropped" },
  { value: "plan_to_read", label: "Plan to Read" },
  { value: "completed", label: "Completed" },
  { value: "re_reading", label: "Re-Reading" },
];

export default function AddToLibraryModal({
  isOpen,
  onClose,
  manga,
  mangaId,
  onSuccess,
}: AddToLibraryModalProps) {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      // Fetch current reading status from app's library
      fetchCurrentStatus();
    }
  }, [isOpen, user, mangaId]);

  const fetchCurrentStatus = async () => {
    try {
      const response = await AppApi.User.getLibraryStatus(mangaId);
      if (response.success) {
        const status = response.status;
        setCurrentStatus(status);
        setSelectedStatus(status);
      } else {
        setCurrentStatus(null);
        setSelectedStatus(null);
      }
    } catch (error) {
      console.error("Failed to fetch current status:", error);
      setCurrentStatus(null);
      setSelectedStatus(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to add manga to library");
      return;
    }

    setIsSubmitting(true);
    try {
      // Update status via app's API
      await AppApi.User.updateLibraryStatus(mangaId, selectedStatus);

      toast.success(
        selectedStatus
          ? `Added to library as "${READING_STATUS_OPTIONS.find((opt) => opt.value === selectedStatus)?.label}"`
          : "Removed from library",
      );

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: any) {
      console.error("Failed to update reading status:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update reading status",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const coverArt = Utils.Mangadex.getCoverArt(manga);
  const title = Utils.Mangadex.getMangaTitle(manga);
  const selectedOption = READING_STATUS_OPTIONS.find(
    (opt) => opt.value === selectedStatus,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-4xl rounded-lg bg-neutral-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-700 p-6">
          <h2 className="text-3xl font-semibold text-white">Add To Library</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex gap-6 p-6">
          {/* Left: Cover Art */}
          <div className="shrink-0">
            <div
              className="relative overflow-hidden rounded"
              style={{
                width: "200px",
                aspectRatio: 2 / 3,
              }}
            >
              <img
                src={coverArt}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Right: Details and Controls */}
          <div className="flex-1">
            {/* Title */}
            <h3 className="mb-6 text-3xl font-bold text-white">{title}</h3>

            {/* Reading Status */}
            <div className="mb-6">
              <label className="mb-2 block text-2xl text-white">
                Reading Status
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex w-full items-center justify-between rounded border border-white/20 bg-neutral-700 px-4 py-3 text-2xl text-white hover:bg-neutral-600"
                >
                  <span>{selectedOption?.label || "Reading Status"}</span>
                  <Iconify
                    icon={isDropdownOpen ? "fa:chevron-up" : "fa:chevron-down"}
                    className="h-5 w-5"
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="absolute inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute z-20 mt-1 w-full rounded border border-white/20 bg-neutral-700 shadow-lg">
                      {READING_STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value || "none"}
                          type="button"
                          onClick={() => {
                            setSelectedStatus(option.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-2xl text-white transition-colors hover:bg-neutral-600 ${
                            selectedStatus === option.value
                              ? "bg-neutral-600"
                              : ""
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Notification Button */}
            <div className="mb-6">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded bg-orange-500 text-white hover:bg-orange-600"
                title="Enable notifications"
              >
                <Iconify icon="fa:bell" className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-700 p-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 px-6 py-3 text-2xl text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-orange-500 px-6 py-3 text-2xl text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
