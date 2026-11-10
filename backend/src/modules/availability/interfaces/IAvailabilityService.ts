import type { Types } from "mongoose";

import type { IMonthlyCalendar } from "./ICalander";
import type { BlockAvailabilityDTO } from "../dtos/BlockAvailabilityDto";
import type { IAvailability } from "../../../shared/interfaces/IAvailability";

export interface IAvailabilityService {
  getMonthlyCalendar(
    photographerId: Types.ObjectId,
    month: number,
    year: number
  ): Promise<IMonthlyCalendar>;

  blockDates(
    photographerId: Types.ObjectId,
    data: BlockAvailabilityDTO
  ): Promise<IAvailability>;

  unblockDates(
    photographerId: Types.ObjectId,
    availabilityId: string
  ): Promise<boolean>;
}