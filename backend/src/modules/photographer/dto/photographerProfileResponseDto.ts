import type { IPackage } from "../../../shared/interfaces/IPackage.js";
import type {
  PhotographerApprovalStatus,
  IServiceArea,
} from "../../../shared/interfaces/IPhotographer.js";

export interface photographerProfileResponseDto {
  id: string;
  name: string;
  email: string;
  bio: string;
  phone: string;
  profilePhoto: string;
  coverPhoto: string;
  location: string;
  languages: string[];
  specialities: string[];
  equipment: string[];
  serviceAreas?: IServiceArea[];
  packages: IPackage[];
  instagramUrl?: string;
  approvalStatus: PhotographerApprovalStatus;
  approvedAt?: Date;
  rejectionReason?: string;
  startingPrice?: number;
}
