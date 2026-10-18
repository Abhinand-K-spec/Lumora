import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  UploadCloud,
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { feedService } from "../../services/feedService";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface CreateFeedPostProps {
  onPublished?: () => void;
  onClose?: () => void;
}

export default function CreateFeedPost({
  onPublished,
  onClose,
}: CreateFeedPostProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const imagesRef = useRef<SelectedImage[]>([]);
  imagesRef.current = images;

  // Revoke all remaining object URLs on component unmount
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  function processFiles(incomingFiles: File[]) {
    setError("");

    if (incomingFiles.length === 0) return;

    const remaining = MAX_IMAGES - images.length;

    if (incomingFiles.length > remaining) {
      const msg = `You can select up to ${MAX_IMAGES} images (${remaining} remaining).`;
      setError(msg);
      toast.error(msg);
      return;
    }

    const invalidFile = incomingFiles.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size <= 0 ||
        file.size > MAX_FILE_SIZE
    );

    if (invalidFile) {
      const msg = "Only JPEG, PNG, or WebP images up to 15 MB each are supported.";
      setError(msg);
      toast.error(msg);
      return;
    }

    // Filter out potential duplicates already in state based on name + size
    const newItems: SelectedImage[] = [];
    for (const file of incomingFiles) {
      const isDuplicate = images.some(
        (img) => img.file.name === file.name && img.file.size === file.size
      );
      if (!isDuplicate) {
        newItems.push({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    }

    if (newItems.length === 0) {
      toast.info("Selected images are already added.");
      return;
    }

    setImages((prev) => [...prev, ...newItems]);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    processFiles(files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploading) return;

    const files = Array.from(e.dataTransfer.files ?? []);
    processFiles(files);
  }

  function removeImage(id: string) {
    if (uploading) return;
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  }

  async function handlePublish() {
    if (images.length === 0) {
      const msg = "Please select at least one image.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (caption.trim().length > 1000) {
      const msg = "Caption must not exceed 1000 characters.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);
    setCurrentUploadIndex(0);

    try {
      const uploadedKeys: string[] = [];

      for (let i = 0; i < images.length; i++) {
        setCurrentUploadIndex(i + 1);
        const { file } = images[i];

        // 1. Obtain presigned URL from backend
        const presigned = await feedService.requestUploadUrl(file);

        // 2. Direct upload to R2
        await feedService.uploadToR2(presigned.uploadUrl, file);

        uploadedKeys.push(presigned.key);

        setProgress(Math.round(((i + 1) / images.length) * 100));
      }

      // 3. Persist post record in backend
      await feedService.createPost({
        caption: caption.trim(),
        mediaKeys: uploadedKeys,
      });

      toast.success("Feed post published successfully!");

      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setImages([]);
      setCaption("");
      setProgress(0);

      if (onPublished) {
        onPublished();
      } else {
        navigate("/profile");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to publish feed post.";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  function handleBackOrClose() {
    if (uploading) return;
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  }

  return (
    <div className="min-h-full w-full py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-[#0f1012] border border-border/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-neutral-950/80 border-b border-border/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackOrClose}
              disabled={uploading}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-50"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="font-heading text-lg font-semibold text-text tracking-wide">
                Create Feed Post
              </h2>
              <p className="text-xs text-text-secondary">
                Share high-resolution moments with clients and followers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-medium px-2.5 py-1 rounded-full bg-neutral-900 border border-border/20">
              {images.length}/{MAX_IMAGES} photos
            </span>
            {onClose && (
              <button
                type="button"
                onClick={handleBackOrClose}
                disabled={uploading}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Caption Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Caption
              </label>
              <span
                className={`text-[11px] font-medium ${
                  caption.length > 950 ? "text-amber-400" : "text-text-secondary"
                }`}
              >
                {caption.length}/1000
              </span>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tell the story behind these photographs..."
              maxLength={1000}
              disabled={uploading}
              rows={3}
              className="w-full bg-[#14161a] border border-border/30 rounded-xl px-4 py-3 text-sm text-text placeholder:text-neutral-500 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition disabled:opacity-60 resize-none"
            />
          </div>

          {/* Upload Zone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Media ({images.length}/{MAX_IMAGES})
              </label>
              <span className="text-[11px] text-text-secondary">
                JPEG, PNG, WebP • Max 15 MB each
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading || images.length >= MAX_IMAGES}
              onChange={handleFileChange}
              className="hidden"
            />

            {images.length < MAX_IMAGES && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border/30 hover:border-border/60 bg-[#14161a]/60 hover:bg-[#14161a]"
                } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="w-12 h-12 rounded-full bg-neutral-900 border border-border/30 flex items-center justify-center text-primary mb-3">
                  <UploadCloud size={22} />
                </div>
                <p className="text-sm font-medium text-text mb-1">
                  Drag and drop images here, or{" "}
                  <span className="text-primary hover:underline">browse</span>
                </p>
                <p className="text-xs text-text-secondary">
                  Upload up to {MAX_IMAGES - images.length} more{" "}
                  {MAX_IMAGES - images.length === 1 ? "image" : "images"}
                </p>
              </div>
            )}
          </div>

          {/* Image Previews Grid */}
          {images.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-900 border border-border/30 shadow-md"
                  >
                    <img
                      src={image.previewUrl}
                      alt={image.file.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Order Badge */}
                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md border border-white/10">
                      #{index + 1}
                    </div>

                    {/* Remove Button */}
                    {!uploading && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/75 hover:bg-red-500 text-white transition-colors duration-200 cursor-pointer shadow-sm"
                        title="Remove photo"
                      >
                        <X size={14} />
                      </button>
                    )}

                    {/* File Size Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-[10px] text-text-secondary truncate">
                      {(image.file.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="bg-[#14161a] border border-border/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-text font-medium">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  Uploading {currentUploadIndex} of {images.length}...
                </span>
                <span className="text-primary font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-neutral-950/80 border-t border-border/20 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleBackOrClose}
            disabled={uploading}
            className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text rounded-xl hover:bg-neutral-900 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={uploading || images.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-black bg-primary hover:bg-primary/90 rounded-xl transition duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Publishing Post...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} />
                <span>Publish Post</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
