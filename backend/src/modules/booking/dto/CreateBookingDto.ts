export interface SubEventDTO {
  eventType: string;
  eventDate: string;
  location?: string;
  coordinates?: [number, number];
}

export interface CreateBookingDTO {
  photographerId: string;
  packageId?: string;
  events: SubEventDTO[];
  notes?: string;
}