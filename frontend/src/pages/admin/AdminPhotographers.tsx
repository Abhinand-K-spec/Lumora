import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ExternalLink,
  User,
  MapPin,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { InstagramIcon } from "../../components/common/InstagramIcon";
import adminPhotographerService, {
  type ApprovalRequestItem,
  type ApprovalMetrics,
} from "../../services/adminPhotographerService";

/* ─── Reject Modal ─────────────────────────────────────────────────────────── */
const RejectModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f1012] border border-red-900/30 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-red-900/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-red-400" />
            <h3 className="font-heading text-sm font-semibold text-text">
              Reject Application
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-text-secondary leading-relaxed">
            Please provide a rejection reason. This will be shown to the
            photographer so they know how to improve their application.
          </p>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Portfolio does not meet quality standards. Please ensure at least 20 high-resolution samples are visible on your Instagram..."
            className="w-full bg-neutral-950 border border-border/20 rounded-lg px-4 py-3 text-xs text-text outline-none focus:border-red-500/40 transition resize-none placeholder:text-text-secondary/40 leading-relaxed"
          />
        </div>
        <div className="px-6 py-4 border-t border-border/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) {
                toast.error("Please provide a rejection reason.");
                return;
              }
              onConfirm(reason.trim());
            }}
            disabled={loading}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <RefreshCw size={12} className="animate-spin" />}
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Verification Checklist ───────────────────────────────────────────────── */
const VerificationChecklist = ({ req }: { req: ApprovalRequestItem }) => {
  const pg = req.photographer;
  const checks = [
    { label: "Email & Account Active", done: !!pg?.user },
    { label: "Bio Provided", done: !!(pg?.bio && pg.bio.trim()) },
    {
      label: "Location Specified",
      done: !!(pg?.location && pg.location.trim()),
    },
    {
      label: "Instagram Linked",
      done: !!(pg?.instagramUrl && pg.instagramUrl.trim()),
    },
    { label: "Phone Number Added", done: !!(pg?.phone && pg.phone.trim()) },
    {
      label: "Specialities Listed",
      done: !!(pg?.specialities && pg.specialities.length > 0),
    },
  ];

  return (
    <div className="space-y-1.5">
      <p className="text-[9px] uppercase tracking-widest text-text-secondary font-bold mb-2.5">
        Verification Steps
      </p>
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-2">
          {c.done ? (
            <CheckCircle2
              size={12}
              className="text-emerald-400 flex-shrink-0"
            />
          ) : (
            <div className="w-3 h-3 rounded-full border border-text-secondary/30 flex-shrink-0" />
          )}
          <span
            className={`text-[11px] ${c.done ? "text-text" : "text-text-secondary"}`}
          >
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── Applicant Card ───────────────────────────────────────────────────────── */
const ApplicantCard = ({
  req,
  onApprove,
  onReject,
  actionLoading,
}: {
  req: ApprovalRequestItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  actionLoading: string | null;
}) => {
  const pg = req.photographer;
  const user = pg?.user;
  const isLoading = actionLoading === req._id;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "PH";

  const submittedDate = new Date(req.submittedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-[#0D0E10] border border-border/20 rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-300 group">
      <div className="p-5 grid grid-cols-1 md:grid-cols-[220px_1fr_240px] gap-5">
        {/* LEFT: Identity */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 border border-border/20 flex-shrink-0 flex items-center justify-center">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-primary/60">
                  {initials}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-primary border border-primary/30 bg-primary/5 px-2 py-0.5 rounded">
                  {pg?.specialities?.[0] || "Photographer"}
                </span>
              </div>
              <p className="font-heading text-sm font-semibold text-text leading-tight">
                {user?.name || "Unknown"}
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {pg?.specialities?.slice(0, 2).join(" · ") || "Unspecified"}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            {pg?.location && (
              <div className="flex items-center gap-1.5">
                <MapPin
                  size={11}
                  className="text-text-secondary flex-shrink-0"
                />
                <span className="text-[11px] text-text-secondary">
                  {pg.location}
                </span>
              </div>
            )}
            {user?.email && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-text-secondary truncate">
                  {user.email}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock size={11} className="text-text-secondary flex-shrink-0" />
              <span className="text-[11px] text-text-secondary">
                Submitted {submittedDate}
              </span>
            </div>
          </div>

          {req.status === "REJECTED" && req.rejectionReason && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2">
              <p className="text-[10px] text-red-400 font-semibold mb-0.5">
                Rejection Reason
              </p>
              <p className="text-[10px] text-red-300/70 leading-relaxed">
                {req.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* MIDDLE: Portfolio / Instagram */}
        <div className="flex flex-col justify-center">
          {pg?.instagramUrl ? (
            <div className="bg-neutral-950 border border-border/15 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <InstagramIcon size={14} className="text-[#E1306C]" />
                <p className="text-[11px] font-semibold text-text">
                  External Portfolio Linked
                </p>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Photographer has linked their Instagram profile for portfolio
                review.
              </p>
              <a
                href={pg.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-border/20 text-text text-xs font-semibold rounded-lg transition cursor-pointer group/link"
              >
                <ExternalLink
                  size={12}
                  className="group-hover/link:text-primary transition"
                />
                Review External Assets
              </a>
            </div>
          ) : (
            <div className="bg-neutral-950 border border-border/15 rounded-xl p-4 flex flex-col items-center justify-center gap-3 min-h-[100px] text-center">
              <Camera size={24} className="text-text-secondary/30" />
              <p className="text-xs text-text-secondary">
                No Instagram URL provided
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Checklist + Actions */}
        <div className="space-y-4 flex flex-col justify-between">
          <VerificationChecklist req={req} />

          {req.status === "PENDING" && (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onApprove(req._id)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-black font-semibold text-xs rounded-lg hover:bg-secondary transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <ShieldCheck size={13} />
                )}
                Approve
              </button>
              <button
                onClick={() => onReject(req._id)}
                disabled={isLoading}
                className="w-full text-[11px] text-red-400 hover:text-red-300 font-semibold text-center py-1 transition cursor-pointer disabled:opacity-50"
              >
                Reject Application
              </button>
            </div>
          )}

          {req.status === "APPROVED" && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold pt-2">
              <CheckCircle2 size={14} />
              <span>Approved</span>
            </div>
          )}

          {req.status === "REJECTED" && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-semibold pt-2">
              <XCircle size={14} />
              <span>Rejected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ────────────────────────────────────────────────────────────── */
const AdminPhotographers = () => {
  const [activeTab, setActiveTab] = useState<
    "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");
  const [requests, setRequests] = useState<ApprovalRequestItem[]>([]);
  const [metrics, setMetrics] = useState<ApprovalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminPhotographerService.getRequests({
        status: activeTab,
        page: currentPage,
        limit: 5,
      });
      if (res.data) {
        setRequests(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch {
      toast.error("Failed to fetch verification requests.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const res = await adminPhotographerService.getMetrics();
      if (res.data?.metrics) setMetrics(res.data.metrics);
    } catch {
      // non-critical
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Reset to page 1 on tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await adminPhotographerService.reviewRequest(requestId, {
        status: "APPROVED",
      });
      toast.success("Application approved successfully!");
      await fetchRequests();
      await fetchMetrics();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to approve application.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    setRejectSubmitting(true);
    try {
      await adminPhotographerService.reviewRequest(rejectTarget, {
        status: "REJECTED",
        rejectionReason: reason,
      });
      toast.success("Application rejected.");
      setRejectTarget(null);
      await fetchRequests();
      await fetchMetrics();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to reject application.",
      );
    } finally {
      setRejectSubmitting(false);
    }
  };

  const tabs: {
    key: "PENDING" | "APPROVED" | "REJECTED";
    label: string;
    count: number;
  }[] = [
    { key: "PENDING", label: "Pending", count: metrics?.pendingCount ?? 0 },
    { key: "APPROVED", label: "Approved", count: metrics?.approvedCount ?? 0 },
    { key: "REJECTED", label: "Suspended", count: metrics?.rejectedCount ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-body">
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-text-secondary/60">
            Photographers &rsaquo; Verification Requests
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-4xl md:text-5xl font-heading font-normal text-[#D8B06A] tracking-wide">
              Verification Queue
            </h1>
            {/* Status tabs */}
            <div className="flex items-center gap-1 bg-neutral-900/60 border border-border/20 rounded-xl p-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === t.key
                      ? "bg-primary text-black"
                      : "text-text-secondary hover:text-text"
                  }`}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span
                      className={`ml-1.5 text-[10px] font-bold ${activeTab === t.key ? "text-black/70" : "text-text-secondary"}`}
                    >
                      ({t.count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Metric Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Queue Density */}
          <div className="bg-[#0D0E10] border border-border/20 rounded-xl p-5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">
              Queue Density
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-heading font-semibold text-text">
                {metricsLoading ? "–" : (metrics?.pendingCount ?? 0)}
              </span>
              <span className="text-xs text-primary font-semibold mb-1">
                +{metricsLoading ? "–" : (metrics?.pendingCount ?? 0)} Pending
              </span>
            </div>
            <div className="flex gap-0.5 items-end h-6">
              {[3, 5, 4, 7, 6, 8, metrics?.pendingCount ?? 5].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/30 rounded-sm"
                  style={{ height: `${(h / 10) * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Approval Rate */}
          <div className="bg-[#0D0E10] border border-border/20 rounded-xl p-5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">
              Approval Rate
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-heading font-semibold text-text">
                {metricsLoading ? "–" : `${metrics?.approvalRate ?? 0}%`}
              </span>
              <TrendingUp size={16} className="text-emerald-400 mb-1" />
            </div>
            <p className="text-[11px] text-text-secondary">
              {metrics?.totalReviewed ?? 0} applications reviewed in total
            </p>
          </div>
        </div>

        {/* ── Applicant Cards ───────────────────────────────────── */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw size={32} className="animate-spin text-primary" />
              <p className="text-sm text-text-secondary/70">
                Loading verification queue…
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-[#0D0E10] border border-border/20 rounded-2xl">
              <Camera size={40} className="text-text-secondary/20" />
              <p className="text-sm text-text-secondary/60">
                No {activeTab.toLowerCase()} applications
              </p>
            </div>
          ) : (
            requests.map((req) => (
              <ApplicantCard
                key={req._id}
                req={req}
                onApprove={handleApprove}
                onReject={(id) => setRejectTarget(id)}
                actionLoading={actionLoading}
              />
            ))
          )}
        </div>

        {/* ── Pagination ────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-text-secondary">
              Showing {requests.length} of {total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="p-1.5 rounded-lg border border-border/20 text-text-secondary hover:text-text disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-text px-3">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || loading}
                className="p-1.5 rounded-lg border border-border/20 text-text-secondary hover:text-text disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Recent Activities ─────────────────────────────────── */}
        {metrics && (
          <div className="space-y-4">
            <h2 className="font-heading text-2xl text-text tracking-wide">
              Recent Activities
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recently Approved */}
              <div className="bg-[#0D0E10] border border-border/20 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">
                      Recently Approved
                    </p>
                  </div>
                  <span className="text-[10px] text-text-secondary">
                    Last 24h
                  </span>
                </div>
                {metrics.recentlyApproved.length === 0 ? (
                  <p className="text-xs text-text-secondary/50 text-center py-4">
                    None yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {metrics.recentlyApproved.map((a) => (
                      <div
                        key={a._id}
                        className="flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 border border-border/20 flex items-center justify-center text-xs font-bold text-primary">
                            {a.avatarUrl?.length === 1 ? (
                              a.avatarUrl
                            ) : (
                              <User size={14} className="text-text-secondary" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-text">
                              {a.photographerName}
                            </p>
                            <p className="text-[10px] text-text-secondary">
                              Approved by {a.reviewerName}
                            </p>
                          </div>
                        </div>
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Suspended / Rejected */}
              <div className="bg-[#0D0E10] border border-border/20 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <p className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">
                      Suspended Accounts
                    </p>
                  </div>
                  <span className="text-[10px] text-red-400/70 font-semibold">
                    Action Required
                  </span>
                </div>
                {metrics.recentlyRejected.length === 0 ? (
                  <p className="text-xs text-text-secondary/50 text-center py-4">
                    None
                  </p>
                ) : (
                  <div className="space-y-3">
                    {metrics.recentlyRejected.map((a) => (
                      <div
                        key={a._id}
                        className="flex items-center justify-between bg-red-950/10 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-neutral-900 border border-red-900/20 flex items-center justify-center text-xs font-bold text-red-400">
                            {a.avatarUrl?.length === 1 ? (
                              a.avatarUrl
                            ) : (
                              <User size={14} className="text-red-400/60" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-text">
                              {a.photographerName}
                            </p>
                            <p className="text-[10px] text-red-400/60 truncate max-w-[160px]">
                              {a.rejectionReason || "Rejected"}
                            </p>
                          </div>
                        </div>
                        <AlertTriangle
                          size={13}
                          className="text-red-400/60 flex-shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        loading={rejectSubmitting}
      />
    </div>
  );
};

export default AdminPhotographers;
