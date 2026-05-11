"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { X, Loader2, ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — matches server
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ImageUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  aspectRatio?: "square" | "video" | "banner";
}

export function ImageUpload({
  value,
  onChange,
  folder = "general",
  multiple = false,
  maxFiles = 6,
  className = "",
  aspectRatio = "square",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    banner: "aspect-[3/1]",
  };

  function validateFiles(fileArray: File[]): string | null {
    for (const file of fileArray) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return `"${file.name}" is not supported. Use JPEG, PNG, or WebP.`;
      }
      if (file.size > MAX_FILE_SIZE) {
        return `"${file.name}" is too large. Maximum 5MB per image.`;
      }
    }
    return null;
  }

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = multiple ? maxFiles - images.length : 1;

      if (fileArray.length > remainingSlots) {
        toast.error(`You can only upload ${remainingSlots} more image${remainingSlots !== 1 ? "s" : ""}`);
        return;
      }

      // Client-side validation
      const error = validateFiles(fileArray);
      if (error) {
        toast.error(error);
        return;
      }

      setIsUploading(true);

      try {
        const urls: string[] = [];

        for (const file of fileArray) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", folder);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Upload failed");
          }

          const data = await res.json();
          urls.push(data.data.secure_url);
        }

        if (multiple) {
          onChange([...images, ...urls]);
        } else {
          onChange(urls[0]);
        }

        toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
        // Reset input so the same file can be re-selected
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [folder, images, maxFiles, multiple, onChange]
  );

  const handleRemove = useCallback(
    (url: string) => {
      if (multiple) {
        onChange(images.filter((img) => img !== url));
      } else {
        onChange("");
      }
    },
    [images, multiple, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload]
  );

  return (
    <div className={className}>
      {/* Preview Grid */}
      {images.length > 0 && (
        <div className={`grid gap-3 mb-3 ${multiple ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}>
          {images.map((url) => (
            <ImagePreview
              key={url}
              url={url}
              aspectRatio={aspectClasses[aspectRatio]}
              onRemove={() => handleRemove(url)}
            />
          ))}
        </div>
      )}

      {/* Upload Area */}
      {(multiple ? images.length < maxFiles : images.length === 0) && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl transition-all ${
            dragActive
              ? "border-brand-orange bg-brand-orange/5 scale-[1.01]"
              : "border-border/50 hover:border-brand-orange/40"
          } ${aspectClasses[aspectRatio]} flex flex-col items-center justify-center cursor-pointer`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple={multiple}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUpload(e.target.files);
              }
            }}
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-7 text-brand-orange animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4">
              {dragActive ? (
                <Upload className="size-7 text-brand-orange" />
              ) : (
                <ImageIcon className="size-7 text-muted-foreground/60" />
              )}
              <p className="text-sm text-muted-foreground text-center">
                <span className="text-brand-orange font-medium">Click to upload</span>{" "}
                or drag and drop
              </p>
              <p className="text-[11px] text-muted-foreground">
                JPEG, PNG, WebP — max 5MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Image Preview with error fallback ───────────────────────────────────────

function ImagePreview({ url, aspectRatio, onRemove }: { url: string; aspectRatio: string; onRemove: () => void }) {
  const [error, setError] = useState(false);

  return (
    <div className={`relative group rounded-xl overflow-hidden border border-border/50 ${aspectRatio}`}>
      {error ? (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 to-amber-100 flex items-center justify-center">
          <ImageIcon className="size-8 text-brand-orange/30" />
        </div>
      ) : (
        <Image
          src={url}
          alt="Upload"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
          onError={() => setError(true)}
        />
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-destructive text-white hover:bg-destructive/90 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
