import type { editProfileDto } from "../dto/editProfileDto.js";
import type { profileResponseDto } from "../dto/profileResponseDto.js";
import type { photographerProfileResponseDto } from "../../photographer/dto/photographerProfileResponseDto.js";

export interface IUserService {
  getProfile(userId: string): Promise<profileResponseDto>;
  editProfile(
    userId: string,
    data: editProfileDto,
  ): Promise<profileResponseDto>;
  toggleSavePhotographer(
    userId: string,
    photographerId: string,
  ): Promise<{ isSaved: boolean }>;
  isPhotographerSaved(
    userId: string,
    photographerId: string,
  ): Promise<boolean>;
  getSavedPhotographers(
    userId: string,
  ): Promise<photographerProfileResponseDto[]>;
  getSavedPhotographerIds(userId: string): Promise<string[]>;
}
