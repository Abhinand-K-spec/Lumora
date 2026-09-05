import { AUTH_MESSAGES } from "../../../shared/constants/message.constant.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { sendSuccess } from "../../../shared/utils/response.utils.js";
import type { IPhotographerService } from "../interfaces/IPhotographerService.js";
import type { Request, Response } from "express";

export class PhotographerController {
  constructor(private readonly _photographerService: IPhotographerService) {}

  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const photographer = await this._photographerService.getProfile(userId);

    sendSuccess(res,{photographer},AUTH_MESSAGES.PROFILE);
  }

  async getPhotographerById(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    if (!userId) {
      throw new AppError(HttpStatus.BAD_REQUEST, "User ID is required");
    }

    const photographer = await this._photographerService.getProfile(
      userId.toString()
    );

    sendSuccess(res,{photographer},AUTH_MESSAGES.PROFILE);
  }

  async editProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const photographer = await this._photographerService.editProfile(
      userId,
      req.body
    );

    sendSuccess(res,{photographer},AUTH_MESSAGES.PROFILE_UPDATED);
  }

  async getPhotographers(req: Request, res: Response): Promise<void> {
    const { search, district, service, price } = req.query;

    const photographers = await this._photographerService.getPhotographers({
      search: search ? String(search) : undefined,
      district: district ? String(district) : undefined,
      service: service ? String(service) : undefined,
      price: price ? String(price) : undefined,
    });

    sendSuccess(res,{photographers},AUTH_MESSAGES.PHOTOGRAPHER_FETCHED);
  }

  async uploadProfilePhoto(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const updatedProfile = await this._photographerService.editProfile(userId, {
      profilePhoto: req.body.profilePhoto,
    });

    sendSuccess(res,{
      photoUrl: updatedProfile.profilePhoto,
    },AUTH_MESSAGES.PROFILE_UPDATED);
  }

  async uploadCoverPhoto(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const updatedProfile = await this._photographerService.editProfile(userId, {
      coverPhoto: req.body.profilePhoto,
    });

    sendSuccess(res,{
      coverPhotoUrl: updatedProfile.coverPhoto,
    },'Cover photo updated successfully');
  }

  async addPackage(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const {
      packageName,
      price,
      description,
      framesIncluded,
      droneIncluded,
      albumIncluded,
      videographersIncluded,
      status,
    } = req.body;

    if (!packageName || price === undefined || !description) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Missing package details");
    }

    const updatedProfile = await this._photographerService.addPackage(userId, {
      packageName,
      price: Number(price),
      description,
      framesIncluded: Boolean(framesIncluded),
      droneIncluded: Boolean(droneIncluded),
      albumIncluded: Boolean(albumIncluded),
      videographersIncluded: Boolean(videographersIncluded),
      status: status || "active",
    });


    sendSuccess(res,{photographer:updatedProfile},AUTH_MESSAGES.PACKAGE_ADDED,HttpStatus.CREATED);
  }

  async editPackage(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { packageId } = req.params;
    const {
      packageName,
      price,
      description,
      framesIncluded,
      droneIncluded,
      albumIncluded,
      videographersIncluded,
      status,
    } = req.body;

    if (!packageId || !packageName || price === undefined || !description) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Missing package details");
    }

    const updatedProfile = await this._photographerService.editPackage(
      userId,
      packageId as string,
      {
        packageName,
        price: Number(price),
        description,
        framesIncluded: Boolean(framesIncluded),
        droneIncluded: Boolean(droneIncluded),
        albumIncluded: Boolean(albumIncluded),
        videographersIncluded: Boolean(videographersIncluded),
        status: status || "active",
      }
    );

    sendSuccess(res,{photographer:updatedProfile},AUTH_MESSAGES.PACKAGE_UPDATED)
  }

  async deletePackage(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const { packageId } = req.params;
    if (!packageId) {
      throw new AppError(HttpStatus.BAD_REQUEST, "Missing package ID");
    }

    const updatedProfile = await this._photographerService.deletePackage(
      userId,
      packageId as string
    );


    sendSuccess(res,{photographer:updatedProfile},AUTH_MESSAGES.PACKAGE_DELETED)
  }
}