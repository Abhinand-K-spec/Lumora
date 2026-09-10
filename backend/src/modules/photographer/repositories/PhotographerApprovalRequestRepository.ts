import PhotographerApprovalRequest from "../../../shared/models/photographerApprovalRequest.model.js";
import Photographer from "../../../shared/models/photographer.model.js";
import Users from "../../../shared/models/users.model.js";
import Package from "../../../shared/models/package.model.js";
import { BaseRepository } from "../../../shared/repository/BaseRepository.js";
import type {
  IPhotographerApprovalRequest,
  ApprovalRequestStatus,
} from "../../../shared/interfaces/IPhotographerApprovalRequest.js";
import type { IPackage } from "../../../shared/interfaces/IPackage.js";
import type {
  IPhotographerApprovalRequestRepository,
  ApprovalMetrics,
  ApprovalActivityItem,
} from "./IPhotographerApprovalRequestRepository.js";

export class PhotographerApprovalRequestRepository
  extends BaseRepository<IPhotographerApprovalRequest>
  implements IPhotographerApprovalRequestRepository
{
  constructor() {
    super(PhotographerApprovalRequest);
  }

  // Override base findById to enrich with photographer + user + packages
  async findById(id: string): Promise<IPhotographerApprovalRequest | null> {
    const request = await PhotographerApprovalRequest.findById(id).lean();
    if (!request) return null;

    const photographer = await Photographer.findById(
      request.photographerId,
    ).lean();
    let user = null;
    let packages: IPackage[] = [];
    if (photographer) {
      user = await Users.findById(photographer.userId)
        .select("-password")
        .lean();
      packages = await Package.find({
        photographerId: photographer._id,
      }).lean();
    }

    return {
      ...request,
      photographer: photographer ? { ...photographer, user, packages } : null,
    };
  }

  async findPendingByPhotographerId(
    photographerId: string,
  ): Promise<IPhotographerApprovalRequest | null> {
    return await PhotographerApprovalRequest.findOne({
      photographerId,
      status: "PENDING",
    });
  }

  async findByPhotographerId(
    photographerId: string,
  ): Promise<IPhotographerApprovalRequest[]> {
    return await PhotographerApprovalRequest.find({ photographerId })
      .sort({ submittedAt: -1 })
      .lean();
  }

  async findAllPaginated(
    filter: Record<string, unknown>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1> = { submittedAt: -1 },
  ): Promise<[IPhotographerApprovalRequest[], number]> {
    const [requests, total] = await Promise.all([
      PhotographerApprovalRequest.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("reviewedBy", "name email")
        .lean(),
      PhotographerApprovalRequest.countDocuments(filter).exec(),
    ]);

    // Enhance each request with photographer, user, and packages
    const enhancedRequests = await Promise.all(
      requests.map(async (req) => {
        const photographer = await Photographer.findById(
          req.photographerId,
        ).lean();
        let user = null;
        let packages: IPackage[] = [];
        if (photographer) {
          user = await Users.findById(photographer.userId)
            .select("-password")
            .lean();
          packages = await Package.find({
            photographerId: photographer._id,
          }).lean();
        }
        return {
          ...req,
          photographer: photographer
            ? { ...photographer, user, packages }
            : null,
        };
      }),
    );

    return [enhancedRequests, total];
  }

  async updateStatus(
    id: string,
    status: ApprovalRequestStatus,
    adminId: string,
    rejectionReason?: string,
  ): Promise<IPhotographerApprovalRequest | null> {
    const updatePayload: {
      status: ApprovalRequestStatus;
      reviewedAt: Date;
      reviewedBy: string;
      rejectionReason?: string | null;
    } = {
      status,
      reviewedAt: new Date(),
      reviewedBy: adminId,
    };

    if (rejectionReason) {
      updatePayload.rejectionReason = rejectionReason;
    } else {
      updatePayload.rejectionReason = null;
    }

    return await PhotographerApprovalRequest.findByIdAndUpdate(
      id,
      updatePayload,
      {
        new: true,
      },
    );
  }

  async getMetrics(): Promise<ApprovalMetrics> {
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      PhotographerApprovalRequest.countDocuments({ status: "PENDING" }).exec(),
      PhotographerApprovalRequest.countDocuments({ status: "APPROVED" }).exec(),
      PhotographerApprovalRequest.countDocuments({ status: "REJECTED" }).exec(),
    ]);

    const totalReviewed = approvedCount + rejectedCount;
    const approvalRate =
      totalReviewed > 0
        ? Number(((approvedCount / totalReviewed) * 100).toFixed(1))
        : 0;

    const [recentlyApprovedDocs, recentlyRejectedDocs] = await Promise.all([
      PhotographerApprovalRequest.find({ status: "APPROVED" })
        .sort({ reviewedAt: -1 })
        .limit(5)
        .populate("reviewedBy", "name")
        .lean(),
      PhotographerApprovalRequest.find({ status: "REJECTED" })
        .sort({ reviewedAt: -1 })
        .limit(5)
        .populate("reviewedBy", "name")
        .lean(),
    ]);

    const formatActivity = async (
      docs: IPhotographerApprovalRequest[],
    ): Promise<ApprovalActivityItem[]> => {
      return await Promise.all(
        docs.map(async (doc) => {
          const pg = await Photographer.findById(doc.photographerId).lean();
          const u = pg
            ? await Users.findById(pg.userId)
                .select("name email profilePhoto")
                .lean()
            : null;
          const reviewerObj =
            doc.reviewedBy &&
            typeof doc.reviewedBy === "object" &&
            "name" in doc.reviewedBy
              ? (doc.reviewedBy as { name?: string })
              : null;
          const item: ApprovalActivityItem = {
            _id: doc._id,
            photographerId: doc.photographerId,
            status: doc.status,
            photographerName: u?.name || "Unknown Photographer",
            avatarUrl: pg?.profilePhoto || u?.name?.charAt(0) || "",
            reviewerName: reviewerObj?.name || "System Admin",
          };
          if (doc.reviewedAt) item.reviewedAt = doc.reviewedAt;
          if (doc.rejectionReason) item.rejectionReason = doc.rejectionReason;
          return item;
        }),
      );
    };

    const [recentlyApproved, recentlyRejected] = await Promise.all([
      formatActivity(recentlyApprovedDocs),
      formatActivity(recentlyRejectedDocs),
    ]);

    return {
      pendingCount,
      totalReviewed,
      approvedCount,
      rejectedCount,
      approvalRate,
      recentlyApproved,
      recentlyRejected,
    };
  }
}
