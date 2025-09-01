import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const [imageSrc, setImageSrc] = useState(other.src);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset error state when src changes
  useEffect(() => {
    if (other.src !== imageSrc) {
      setImageSrc(other.src);
      setError(false);
      setRetryCount(0);
      setLoaded(false);
      setIsLoading(true);
    }
  }, [other.src, imageSrc]);

  const handleRetry = useCallback(() => {
    setError(false);
    setRetryCount((prev) => prev + 1);
    setIsLoading(true);
    
    // Force reload by changing the src slightly
    if (other.src) {
      const separator = other.src.includes("?") ? "&" : "?";
      const timestamp = Date.now();
      const newSrc = `${other.src}${separator}_retry=${timestamp}`;
      setImageSrc(newSrc);
    }
  }, [other.src]);

  const handleDataSaverToggle = useCallback(() => {
    onDataSaverChange();
    // Reset states when toggling data saver
    setError(false);
    setRetryCount(0);
    setLoaded(false);
    setIsLoading(true);
  }, [onDataSaverChange]);

  const handleImageLoad = useCallback(() => {
    setLoaded(true);
    setIsLoading(false);
    setError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setError(true);
    setIsLoading(false);
    setLoaded(false);
    
    // Enhanced error logging for debugging
    console.error("Image failed to load:", {
      src: other.src,
      currentSrc: imageSrc,
      retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      serviceWorker: 'serviceWorker' in navigator ? 'available' : 'not available'
    });
  }, [other.src, imageSrc, retryCount]);

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
      {/* Show loading state */}
      {isLoading && !loaded && (
        <div className="flex items-center justify-center h-full min-h-[200px] bg-gray-100 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Todo: Fix compatibility issue */}
      {React.createElement(LazyLoadImage as any, {
        wrapperClassName: "block mx-auto",
        effect: disabledEffect ? undefined : effect,
        placeholderSrc: "/images/truyendex-loading.jpg",
        className: "mx-auto h-full object-cover",
        width: maxImageWidth || "100%",
        src: imageSrc,
        onLoad: handleImageLoad,
        onError: handleImageError,
        threshold: threshold,
        // Add cache-friendly attributes
        loading: "lazy",
        decoding: "async",
        // Add crossOrigin for external images
        crossOrigin: imageSrc?.includes("mangadex.org") ? "anonymous" : undefined,
        // Add referrer policy for better caching
        referrerPolicy: "no-referrer",
        ...(other as any),
      })}
    </span>
  );
}
