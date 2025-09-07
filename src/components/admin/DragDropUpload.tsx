"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, X, Image } from "lucide-react";
import { Button } from "@/components/shadcn/button";

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  accept: string;
  maxSize: number; // in bytes
  disabled?: boolean;
  currentFile?: string;
  onRemove?: () => void;
  type: "logo" | "favicon";
}

export function DragDropUpload({
  onFileSelect,
  accept,
  maxSize,
  disabled = false,
  currentFile,
  onRemove,
  type,
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypes = accept.split(",").map((type) => type.trim());
    if (
      !acceptedTypes.some((acceptedType) => {
        if (acceptedType.includes("*")) {
          return file.type.startsWith(acceptedType.replace("*", ""));
        }
        return file.type === acceptedType;
      })
    ) {
      return `Invalid file type. Accepted types: ${accept}`;
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getRecommendedSize = () => {
    return type === "logo" ? "200x60px" : "32x32px";
  };

  const getMaxSizeMB = () => {
    return maxSize / (1024 * 1024);
  };

  return (
    <div className="space-y-3">
      <div
        className={`relative rounded-lg border-2 border-dashed p-6 transition-colors ${
          isDragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!disabled ? triggerFileInput : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {currentFile ? (
          <div className="flex items-center justify-center space-x-4">
            <div className="relative">
              <img
                src={currentFile}
                alt={`Current ${type}`}
                className={`${type === "logo" ? "h-16 w-16" : "h-12 w-12"} rounded-lg border bg-gray-50 object-contain`}
              />
              {onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                  title={`Remove ${type}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                {type === "logo" ? "Logo" : "Favicon"} uploaded
              </p>
              <p className="text-xs text-gray-500">
                Click to replace or drag a new file
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              {isDragOver ? (
                <Upload className="h-12 w-12 text-blue-500" />
              ) : (
                <Image className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              {isDragOver
                ? "Drop your file here"
                : `Upload ${type === "logo" ? "Logo" : "Favicon"}`}
            </p>
            <p className="mb-4 text-xs text-gray-500">
              Drag and drop or click to select
            </p>
            <div className="space-y-1 text-xs text-gray-400">
              <p>Recommended size: {getRecommendedSize()}</p>
              <p>Max file size: {getMaxSizeMB()}MB</p>
              <p>Formats: {accept}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {currentFile && (
        <div className="flex space-x-2">
          <Button
            onClick={triggerFileInput}
            disabled={disabled}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Replace {type === "logo" ? "Logo" : "Favicon"}
          </Button>
          <Button
            onClick={() => window.open(currentFile, "_blank")}
            variant="outline"
            size="sm"
          >
            Preview
          </Button>
        </div>
      )}
    </div>
  );
}
