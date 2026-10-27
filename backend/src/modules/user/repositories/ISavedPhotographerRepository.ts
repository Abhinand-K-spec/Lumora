import type { ISavedPhotographer } from "../../../shared/interfaces/ISavedPhotographer.js";

export interface ISavedPhotographerRepository {
  save(userId: string, photographerId: string): Promise<ISavedPhotographer>;
  unsave(userId: string, photographerId: string): Promise<boolean>;
  isSaved(userId: string, photographerId: string): Promise<boolean>;
  findByUserId(userId: string): Promise<ISavedPhotographer[]>;
  getSavedPhotographerIds(userId: string): Promise<string[]>;
}
