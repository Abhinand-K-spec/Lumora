import type { IPhotographer } from "../../../shared/interfaces/IPhotographer.js";

export interface IPhotographerRepository {
  create(photographer: Partial<IPhotographer>): Promise<IPhotographer>;
  findById(id: string): Promise<IPhotographer | null>;
  findByEmail(email: string): Promise<IPhotographer | null>;
  update(
    id: string,
    data: Partial<IPhotographer>,
  ): Promise<IPhotographer | null>;
  deleteById(id: string): Promise<boolean>;
  exists(email: string): Promise<boolean>;
  updateRefreshToken(
    id: string,
    refreshToken: string,
  ): Promise<IPhotographer | null>;
  findByUserId(id: string): Promise<IPhotographer | null>;
  findAllPaginated(
    filter: any,
    skip: number,
    limit: number,
    sort?: Record<string, 1 | -1>,
  ): Promise<[IPhotographer[], number]>;
}
