import SavedPhotographer from "../../../shared/models/savedPhotographer.model.js";
import type { ISavedPhotographer } from "../../../shared/interfaces/ISavedPhotographer.js";
import type { ISavedPhotographerRepository } from "./ISavedPhotographerRepository.js";

export class SavedPhotographerRepository
  implements ISavedPhotographerRepository
{
  async save(
    userId: string,
    photographerId: string,
  ): Promise<ISavedPhotographer> {
    return (await SavedPhotographer.findOneAndUpdate(
      { userId, photographerId },
      { userId, photographerId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )) as ISavedPhotographer;
  }

  async unsave(userId: string, photographerId: string): Promise<boolean> {
    const res = await SavedPhotographer.deleteOne({ userId, photographerId });
    return (res.deletedCount ?? 0) > 0;
  }

  async isSaved(userId: string, photographerId: string): Promise<boolean> {
    const item = await SavedPhotographer.findOne({ userId, photographerId });
    return !!item;
  }

  async findByUserId(userId: string): Promise<ISavedPhotographer[]> {
    return await SavedPhotographer.find({ userId }).sort({ createdAt: -1 });
  }

  async getSavedPhotographerIds(userId: string): Promise<string[]> {
    const items = await SavedPhotographer.find({ userId })
      .select("photographerId")
      .lean();
    return items.map((i) => i.photographerId);
  }
}
