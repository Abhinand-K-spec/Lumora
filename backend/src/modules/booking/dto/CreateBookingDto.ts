export interface CreateBookingDTO {
    photographerId: string;
    packageId?: string;
    eventType: string;
    eventDate: string;
    location?: string;
    notes?: string;
    totalPrice?: number;
  }