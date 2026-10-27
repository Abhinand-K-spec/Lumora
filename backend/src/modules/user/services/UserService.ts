import type { IUserService } from "../interfaces/IUserService.js";
import type { IUserRepository } from "../../auth/interfaces/IUserRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { profileResponseDto } from "../dto/profileResponseDto.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { AUTH_MESSAGES } from "../../../shared/constants/message.constant.js";
import type { IUserProfileRepository } from "../repositories/IUserProfileRepository.js";
import { userProfileMapper } from "../dto/userProfileMapper.js";
import type { editProfileDto } from "../dto/editProfileDto.js";
import type { IUser } from "../../../shared/interfaces/IUser.js";
import type { ISavedPhotographerRepository } from "../repositories/ISavedPhotographerRepository.js";
import type { IPhotographerRepository } from "../../photographer/repositories/IPhotographerRepository.js";
import type { IPackageRepository } from "../../photographer/interfaces/IPackageRepository.js";
import { photographerProfileMapper } from "../../photographer/dto/photographerProfileMapper.js";
import type { photographerProfileResponseDto } from "../../photographer/dto/photographerProfileResponseDto.js";

export class UserService implements IUserService {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _userProfileRepository: IUserProfileRepository,
    private readonly _savedPhotographerRepository: ISavedPhotographerRepository,
    private readonly _photographerRepository: IPhotographerRepository,
    private readonly _packageRepository: IPackageRepository,
  ) {}

  async getProfile(userId: string): Promise<profileResponseDto> {
    const user = await this._userRepository.findById(userId);

    if (!user) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const profile = await this._userProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new AppError(HttpStatus.NOT_FOUND, "User profile not found");
    }

    return userProfileMapper.toUserProfileResponse(user, profile);
  }

  async editProfile(
    userId: string,
    data: editProfileDto,
  ): Promise<profileResponseDto> {
    let user = await this._userRepository.findById(userId);

    const { phone, profilePhoto } = data;
    if (!user) {
      throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
    }

    if (data.name !== undefined) {
      user = await this._userRepository.update(userId, { name: data.name });
    }

    let profile = await this._userProfileRepository.findByUserId(userId);

    const hasChanges = phone !== undefined || profilePhoto !== undefined;

    if (!profile) {
      profile = await this._userProfileRepository.create({
        userId,
        phone: phone || "",
        profilePhoto: profilePhoto || "",
      });
    } else if (hasChanges) {
      const profileData: Partial<IUser> = {};

      if (phone !== undefined) {
        profileData.phone = phone;
      }

      if (profilePhoto !== undefined) {
        profileData.profilePhoto = profilePhoto;
      }

      profile = await this._userProfileRepository.update(
        profile._id.toString(),
        profileData,
      );
    }

    return userProfileMapper.toUserProfileResponse(user!, profile!);
  }

  async toggleSavePhotographer(
    userId: string,
    photographerId: string,
  ): Promise<{ isSaved: boolean }> {
    const exists = await this._savedPhotographerRepository.isSaved(
      userId,
      photographerId,
    );
    if (exists) {
      await this._savedPhotographerRepository.unsave(userId, photographerId);
      return { isSaved: false };
    } else {
      await this._savedPhotographerRepository.save(userId, photographerId);
      return { isSaved: true };
    }
  }

  async isPhotographerSaved(
    userId: string,
    photographerId: string,
  ): Promise<boolean> {
    return await this._savedPhotographerRepository.isSaved(
      userId,
      photographerId,
    );
  }

  async getSavedPhotographers(
    userId: string,
  ): Promise<photographerProfileResponseDto[]> {
    const savedRecords =
      await this._savedPhotographerRepository.findByUserId(userId);

    const result: photographerProfileResponseDto[] = [];

    for (const record of savedRecords) {
      const photographer = await this._photographerRepository.findByUserId(
        record.photographerId,
      );

      if (!photographer) continue;

      const user = await this._userRepository.findById(record.photographerId);
      if (!user) continue;

      const packages = await this._packageRepository.findByPhotographerId(
        photographer._id.toString(),
      );

      result.push(
        photographerProfileMapper.toProfileResponse(
          user,
          photographer,
          packages,
        ),
      );
    }

    return result;
  }

  async getSavedPhotographerIds(userId: string): Promise<string[]> {
    return await this._savedPhotographerRepository.getSavedPhotographerIds(
      userId,
    );
  }
}
