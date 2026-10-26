import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Heart,
  Share2,
  Bookmark,
  Camera,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  Layers,
} from "lucide-react";
import { feedService, type FeedPost } from "../../services/feedService";

interface FeedPostCardProps {
  post: FeedPost;
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: (id: string) => void;
  onToggleSave: (id: string) => void;
}

const FeedPostCard = ({
  post,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
}: FeedPostCardProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  const mediaList = post.media || [];
  const mediaCount = mediaList.length;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % mediaCount);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + mediaCount) % mediaCount);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/feed`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Photography by ${post.author.name}`,
          text: post.caption || "Check out this photo on Lumora",
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          toast.error("Failed to share post");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Could not copy link");
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const isLongCaption = post.caption && post.caption.length > 140;

  return (
    <article className="overflow-hidden rounded-2xl border border-border/40 bg-surface/80 backdrop-blur-sm transition-all hover:border-border/70 shadow-xl">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 sm:p-5">
        <Link
          to={post.author.id ? `/photographers/${post.author.id}` : "#"}
          className="group flex min-w-0 items-center gap-3.5"
        >
          {post.author.profilePhoto ? (
            <img
              src={post.author.profilePhoto}
              alt={post.author.name}
              className="h-11 w-11 shrink-0 rounded-full border border-primary/40 object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-sm font-bold text-primary transition-transform group-hover:scale-105">
              {post.author.name ? post.author.name.charAt(0).toUpperCase() : "P"}
            </div>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-text transition-colors group-hover:text-primary">
              {post.author.name || "Photographer"}
            </h2>
            {post.author.location ? (
              <p className="flex items-center gap-1 text-xs text-text-secondary mt-0.5">
                <MapPin size={11} className="text-primary shrink-0" />
                <span className="truncate">{post.author.location}</span>
              </p>
            ) : (
              <p className="text-xs text-text-secondary mt-0.5">Photographer</p>
            )}
          </div>
        </Link>

        {post.createdAt && (
          <span className="text-xs text-text-secondary/70 shrink-0 font-medium">
            {formatDate(post.createdAt)}
          </span>
        )}
      </div>

      {/* Media Carousel */}
      <div className="relative aspect-[4/5] sm:aspect-square max-h-[640px] w-full bg-neutral flex items-center justify-center overflow-hidden select-none">
        {mediaCount > 0 ? (
          <img
            src={mediaList[activeImageIndex]?.url}
            alt={post.caption || "Feed media"}
            loading="lazy"
            className="h-full w-full object-contain bg-black/40"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-text-secondary text-sm">
            <Camera size={32} className="opacity-40 text-primary" />
            <span>No media attached</span>
          </div>
        )}

        {/* Multi-image indicators & arrows */}
        {mediaCount > 1 && (
          <>
            {/* Top Right Counter Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/10">
              <Layers size={13} className="text-primary" />
              <span>
                {activeImageIndex + 1}/{mediaCount}
              </span>
            </div>

            {/* Prev Arrow */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white/90 backdrop-blur-md transition hover:bg-black/85 hover:text-white border border-white/10"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white/90 backdrop-blur-md transition hover:bg-black/85 hover:text-white border border-white/10"
            >
              <ChevronRight size={20} />
            </button>

            {/* Bottom Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 backdrop-blur-md border border-white/10">
              {mediaList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  aria-label={`Go to image ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeImageIndex
                      ? "w-4 bg-primary"
                      : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-5">
          {/* Like */}
          <button
            type="button"
            onClick={() => onToggleLike(post.id)}
            aria-label={isLiked ? "Unlike post" : "Like post"}
            className={`flex items-center gap-1.5 transition group cursor-pointer ${
              isLiked ? "text-rose-500" : "text-text-secondary hover:text-rose-400"
            }`}
          >
            <Heart
              size={22}
              fill={isLiked ? "currentColor" : "none"}
              className="transition-transform group-hover:scale-110"
            />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share post"
            className="text-text-secondary transition hover:text-primary cursor-pointer group"
          >
            <Share2
              size={20}
              className="transition-transform group-hover:scale-110"
            />
          </button>
        </div>

        {/* Bookmark / Save */}
        <button
          type="button"
          onClick={() => onToggleSave(post.id)}
          aria-label={isSaved ? "Unsave post" : "Save post"}
          className={`transition cursor-pointer group ${
            isSaved ? "text-primary" : "text-text-secondary hover:text-primary"
          }`}
        >
          <Bookmark
            size={22}
            fill={isSaved ? "currentColor" : "none"}
            className="transition-transform group-hover:scale-110"
          />
        </button>
      </div>

      {/* Caption Section */}
      {post.caption && (
        <div className="px-5 pb-5 pt-1 text-sm text-text leading-relaxed">
          <p>
            <Link
              to={post.author.id ? `/photographers/${post.author.id}` : "#"}
              className="font-semibold text-text mr-2 hover:text-primary transition-colors"
            >
              {post.author.name}
            </Link>
            <span>
              {isLongCaption && !isCaptionExpanded
                ? `${post.caption.slice(0, 140)}...`
                : post.caption}
            </span>
          </p>

          {isLongCaption && (
            <button
              type="button"
              onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
              className="mt-1 text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              {isCaptionExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}
    </article>
  );
};

const Feed = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interaction local states
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const loadMoreRef = useRef<HTMLDivElement|null>(null);


  const toggleLike = (postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleSave = (postId: string) => {
    setSavedPosts((prev) => {
      const isSaved = prev.includes(postId);
      if (isSaved) {
        toast.info("Removed from saved items");
        return prev.filter((id) => id !== postId);
      } else {
        toast.success("Saved to your collection");
        return [...prev, postId];
      }
    });
  };

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await feedService.getFeed({ limit:10 });
      setPosts(data.posts || []);
      setHasMore(Boolean(data.hasMore));
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load feed moments";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = async () => {
    if (!nextCursor || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const data = await feedService.getFeed({
        limit: 10,
        cursor: nextCursor,
      });
      setPosts((prev) => [...prev, ...(data.posts || [])]);
      setHasMore(Boolean(data.hasMore));
      setNextCursor(data.nextCursor);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load older moments",
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const sentinel = loadMoreRef.current;
  
    if (!sentinel || !hasMore || isLoading || isLoadingMore) {
      return;
    }
  
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0,
      },
    );
  
    observer.observe(sentinel);
  
    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore, nextCursor]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return (
    <div className="mx-auto max-w-2xl px-2 sm:px-4 py-4 sm:py-6">
      {/* Top Banner & Header */}
      <div className="mb-6 flex items-center justify-between border-b border-border/30 pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
            Curated Community
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-text tracking-wide mt-0.5">
            Photographer Feed
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchFeed}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-full border border-border/50 bg-card px-3.5 py-1.5 text-xs font-medium text-text-secondary transition hover:border-primary/50 hover:text-text disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin text-primary" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Notice */}
      {error && !isLoading && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          <AlertCircle size={18} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={fetchFeed}
            className="text-xs font-semibold underline hover:opacity-80 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Skeletons while loading initial data */}
      {isLoading && (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-border/30 bg-surface/60 p-4 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-border/40" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-32 rounded bg-border/40" />
                  <div className="h-2 w-20 rounded bg-border/30" />
                </div>
              </div>
              <div className="aspect-[4/5] sm:aspect-square w-full rounded-xl bg-border/20" />
              <div className="h-3 w-3/4 rounded bg-border/30" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/30 bg-surface/50 py-16 px-4 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/25">
            <Camera size={26} />
          </div>
          <h3 className="font-heading text-lg font-medium text-text">
            No moments shared yet
          </h3>
          <p className="mt-1 text-xs text-text-secondary max-w-sm">
            Photographers have not uploaded any feed posts yet. As soon as new
            stories are published, they will show up right here.
          </p>
          <button
            type="button"
            onClick={fetchFeed}
            className="mt-5 rounded-full border border-primary/40 bg-primary/10 px-5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20 cursor-pointer"
          >
            Check for Updates
          </button>
        </div>
      )}

      {/* Feed Posts List */}
      {!isLoading && posts.length > 0 && (
        <div className="space-y-6 sm:space-y-8">
          {posts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              isLiked={likedPosts.includes(post.id)}
              isSaved={savedPosts.includes(post.id)}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div
                ref={loadMoreRef}
                className="flex justify-center py-6"
                aria-live="polite"
            >
                {isLoadingMore && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Loading more moments...</span>
                </div>
                )}
            </div>
            )}

          {!hasMore && posts.length > 0 && (
            <div className="py-6 text-center text-xs text-text-secondary/60">
              You're all caught up with the latest moments.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed;