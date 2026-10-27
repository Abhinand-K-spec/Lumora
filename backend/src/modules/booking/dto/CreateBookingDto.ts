export interface SubEventDTO {
  eventType: string;
  eventDate: string;
  location?: string;
}

export interface CreateBookingDTO {
  photographerId: string;
  packageId?: string;
  events: SubEventDTO[];
  notes?: string;
}