import Photographer from "../../../shared/models/photographer.model.js";
import type { IPhotographer } from "../../../shared/interfaces/IPhotographer.js";
import type { IPhotographerRepository } from "./IPhotographerRepository.js";

export class PhotographerRepository implements IPhotographerRepository {
  async create(photographer: Partial<IPhotographer>): Promise<IPhotographer> {
    return await Photographer.create(photographer);
  }

  async findById(id: string): Promise<IPhotographer | null> {
    return await Photographer.findById(id);
  }

  async findByEmail(email: string): Promise<IPhotographer | null> {
    return await Photographer.findOne({ email });
  }

  async update(
    id: string,
    data: Partial<IPhotographer>
  ): Promise<IPhotographer | null> {
    return await Photographer.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Photographer.deleteOne({ _id: id });
    return !!result.deletedCount;
  }

  async exists(email: string): Promise<boolean> {
    const photographer = await Photographer.findOne({ email });
    return !!photographer;
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string
  ): Promise<IPhotographer | null> {
    return await Photographer.findByIdAndUpdate(
      id,
      { refreshToken },
      { new: true }
    );
  }

  async findByUserId(userId: string): Promise<IPhotographer | null> {
    return await Photographer.findOne({ userId });
  }

  async findAllPaginated(
    filter: any,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<[IPhotographer[], number]> {
    const [photographers, total] = await Promise.all([
      Photographer.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      Photographer.countDocuments(filter).exec(),
    ]);
    return [photographers, total];
  }
}
