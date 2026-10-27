import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Camera,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  Eye,
  X,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { feedService, type FeedPost } from "../../../services/feedService";
import { getErrorMessage } from "../../../utils/errorUtils";
import ConfirmationModal from "../../common/ConfirmationModal";

export default function PhotographerMyPosts() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await feedService.getMyPosts({ limit: 50 });
      setPosts(res.posts || []);
    } catch (err: unknown) {
      console.error("Failed to fetch my posts:", err);
      // Fallback: don't break the page if empty or network error
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    try {
      setDeletingId(postToDelete);
      await feedService.deletePost(postToDelete);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
      if (selectedPost?.id === postToDelete) {
        setSelectedPost(null);
      }
      toast.success("Post removed successfully");
      setPostToDelete(null);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to delete post");
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const openPostModal = (post: FeedPost) => {
    setSelectedPost(post);
    setActiveImageIndex(0);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="select-none pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border/20">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-heading text-lg font-semibold text-text tracking-wide">
              My Uploaded Posts
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 font-semibold">
              {posts.length} {posts.length === 1 ? "Post" : "Posts"}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Photographs and stories shared directly to the Lumora client feed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPosts}
            disabled={loading}
            className="p-2 rounded-lg text-text-secondary hover:text-text hover:bg-neutral-900 border border-border/20 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh posts"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <Link
            to="/feedPostUpload"
            className="text-xs bg-primary text-black hover:bg-primary/90 font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
          >
            <Plus size={14} />
            Create Feed Post
          </Link>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[4/5] rounded-xl bg-neutral-900/60 border border-border/20 animate-pulse flex flex-col justify-between p-4"
            >
              <div className="w-12 h-4 bg-neutral-800 rounded" />
              <div className="space-y-2">
                <div className="w-full h-3 bg-neutral-800 rounded" />
                <div className="w-2/3 h-3 bg-neutral-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="bg-[#0f1012] border border-dashed border-border/30 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-border/30 flex items-center justify-center text-primary mb-4 shadow-inner">
            <Camera size={26} />
          </div>
          <h4 className="text-base font-semibold text-text mb-1.5">
            No feed posts uploaded yet
          </h4>
          <p className="text-xs text-text-secondary max-w-md mb-6 leading-relaxed">
            Upload your signature shots, editorial highlights, or behind-the-scenes
            moments. Your posts will appear in client feeds across Lumora.
          </p>
          <Link
            to="/feedPostUpload"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-semibold text-xs rounded-xl hover:bg-primary/90 transition shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Sparkles size={14} />
            Publish Your First Post
          </Link>
        </div>
      )}

      {/* Posts Grid */}
      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {posts.map((post) => {
            const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
            const mediaCount = post.media?.length || 0;

            return (
              <div
                key={post.id}
                onClick={() => openPostModal(post)}
                className="group bg-[#0e0f12] rounded-xl overflow-hidden border border-border/20 hover:border-primary/40 transition-all duration-300 flex flex-col cursor-pointer shadow-lg hover:shadow-primary/5 relative"
              >
                {/* Image Container */}
                <div className="aspect-[4/5] w-full overflow-hidden relative bg-neutral-950">
                  {firstMedia ? (
                    <img
                      src={firstMedia.url}
                      alt={post.caption || "Feed post"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector(".fallback-icon")) {
                          const fallback = document.createElement("div");
                          fallback.className =
                            "fallback-icon w-full h-full flex flex-col items-center justify-center text-text-secondary bg-neutral-900";
                          fallback.innerHTML =
                            '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary">
                      <Camera size={28} />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                  {/* Multi-image Badge */}
                  {mediaCount > 1 && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-semibold text-white border border-white/10">
                      <Layers size={11} />
                      <span>{mediaCount}</span>
                    </div>
                  )}

                  {/* Date Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] text-text-secondary border border-white/5">
                    <Calendar size={10} />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>

                  {/* Hover Quick Actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <span className="p-2 rounded-full bg-neutral-900/90 text-text hover:text-primary transition-colors">
                      <Eye size={16} />
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(post.id);
                      }}
                      disabled={deletingId === post.id}
                      className="p-2 rounded-full bg-red-950/80 text-red-400 hover:bg-red-900 transition-colors cursor-pointer"
                      title="Delete post"
                    >
                      {deletingId === post.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Caption Footer */}
                {post.caption && (
                  <div className="p-3 bg-[#0e0f12] border-t border-border/10">
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {post.caption}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Post Detail / Preview Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="w-full max-w-4xl bg-[#111215] border border-border/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media Carousel Side */}
            <div className="relative md:w-3/5 bg-black flex items-center justify-center overflow-hidden min-h-[340px] md:min-h-[500px]">
              {selectedPost.media && selectedPost.media[activeImageIndex] ? (
                <img
                  src={selectedPost.media[activeImageIndex].url}
                  alt={`Slide ${activeImageIndex + 1}`}
                  className="w-full h-full max-h-[550px] object-contain"
                />
              ) : (
                <div className="text-text-secondary flex flex-col items-center gap-2">
                  <Camera size={32} />
                  <span className="text-xs">No media preview available</span>
                </div>
              )}

              {/* Prev/Next arrows if multiple images */}
              {selectedPost.media && selectedPost.media.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev > 0 ? prev - 1 : selectedPost.media.length - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white transition cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev < selectedPost.media.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white transition cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Indicator Dots */}
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                    {selectedPost.media.map((_, idx) => (
                      <span
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === activeImageIndex
                            ? "w-5 bg-primary"
                            : "w-1.5 bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Post Metadata Side */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between bg-[#111215] border-t md:border-t-0 md:border-l border-border/20 overflow-y-auto">
              <div>
                {/* Modal Top Actions */}
                <div className="flex items-center justify-between pb-4 border-b border-border/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                      {selectedPost.author?.name?.charAt(0) || "P"}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-text">
                        {selectedPost.author?.name || "Photographer"}
                      </h4>
                      <p className="text-[10px] text-text-secondary">
                        {formatDate(selectedPost.createdAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPost(null)}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-neutral-900 transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Caption */}
                <div className="py-4">
                  <h5 className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    Caption
                  </h5>
                  <p className="text-xs text-text leading-relaxed whitespace-pre-wrap">
                    {selectedPost.caption || (
                      <span className="italic text-neutral-500">
                        No caption provided for this post.
                      </span>
                    )}
                  </p>
                </div>

                {/* Media Details */}
                <div className="py-2 text-[11px] text-text-secondary space-y-1">
                  <p>
                    Photos in post:{" "}
                    <span className="text-text font-medium">
                      {selectedPost.media?.length || 0}
                    </span>
                  </p>
                  <p>
                    Viewing photo:{" "}
                    <span className="text-primary font-semibold">
                      {activeImageIndex + 1} of {selectedPost.media?.length || 1}
                    </span>
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-border/20 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteClick(selectedPost.id)}
                  disabled={deletingId === selectedPost.id}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer disabled:opacity-50"
                >
                  {deletingId === selectedPost.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete Post
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-text rounded-lg transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={postToDelete !== null}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        description="Are you sure you want to delete this post from your feed? This action cannot be undone."
        confirmText="Delete Post"
        variant="danger"
        loading={deletingId !== null}
      />
    </div>
  );
}
