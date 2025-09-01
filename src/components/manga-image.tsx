import React, { useState, useCallback } from "react";
import {
  LazyLoadImage,
  LazyLoadImageProps,
} from "react-lazy-load-image-component";
import { Button } from "./nettrom/Button";
import Iconify from "./iconify";

type IProps = LazyLoadImageProps;

interface Props extends IProps {
  index?: number;
  disabledEffect?: boolean;
  threshold?: number;
  fullWidth?: boolean;
  dataSaver: boolean;
  onDataSaverChange: () => void;
  maxImageWidth?: number;
}

export default function MangaImage({
  className = "",
  disabledEffect = false,
  effect = "opacity",
  threshold = 0,
  dataSaver,
  onDataSaverChange,
  maxImageWidth,
  ...other
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = useCallback(() => {
    setError(false);
    setRetryCount((prev) => prev + 1);
    // Force reload by changing the src slightly
    if (other.src) {
      const separator = other.src.includes("?") ? "&" : "&";
      const timestamp = Date.now();
      const newSrc = `${other.src}${separator}_retry=${timestamp}`;
      // Force a complete reload by updating the key
      window.location.reload();
    }
  }, [other.src]);

  const handleDataSaverToggle = useCallback(() => {
    onDataSaverChange();
    // Reset states when toggling data saver
    setError(false);
    setRetryCount(0);
    setLoaded(false);
  }, [onDataSaverChange]);

  if (error)
    return (
      <div className="flex flex-col justify-center gap-2 bg-white/10 px-2 py-5">
        <div className="text-center">
          Fail to load image {(other.index || 0) + 1}
          {retryCount > 0 && ` (Retry ${retryCount})`}
        </div>
        <div className="flex gap-2">
          <Button
            icon={<Iconify icon="fa:refresh" />}
            className="w-full min-w-0"
            onClick={handleRetry}
          >
            Tải lại ảnh
          </Button>
          <Button
            icon={
              <Iconify icon={dataSaver ? "fa:caret-down" : "fa:caret-up"} />
            }
            className="w-full min-w-0"
            onClick={handleDataSaverToggle}
          >
            {dataSaver ? "Disable data saver" : "Enable data saver"}
          </Button>
        </div>
      </div>
    );

  return (
    <span
      className={`block overflow-hidden ${loaded ? "min-h-0" : "min-h-[100vh]"} ${className}`}
    >
      {/* Todo: Fix compatibility issue */}
      {React.createElement(LazyLoadImage as any, {
        wrapperClassName: "block mx-auto",
        effect: disabledEffect ? undefined : effect,
        placeholderSrc: "/images/truyendex-loading.jpg",
        className: "mx-auto h-full object-cover",
        width: maxImageWidth || "100%",
        onLoad: () => setLoaded(true),
        onError: () => setError(true),
        threshold: threshold,
        // Simple attributes - no complex caching
        loading: "lazy",
        decoding: "async",
        // Force fresh load each time
        key: `${other.src}_${retryCount}_${Date.now()}`,
        ...(other as any),
      })}
    </span>
  );
}
