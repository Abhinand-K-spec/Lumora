export interface EventProgram {
    name: string;
    date: string;
    location?: string;
    coordinates?: [number, number];
  }
  
  export type EventStatus =
    | "UPCOMING"
    | "ONGOING"
    | "COMPLETED"
    | "CANCELLED";
  
  export interface EventPhotographerInfo {
    _id: string;
    name: string;
    email?: string;
  }

  export interface EventItem {
    _id: string;
    bookingId: string;
    photographerId: string | EventPhotographerInfo;
    userId: string;
    name: string;
    description?: string;
    programs: EventProgram[];
    publicId: string;
    status: EventStatus;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CreateEventPayload {
    bookingId: string;
    name: string;
    description?: string;
  }
  
  export interface UpdateEventPayload {
    name?: string;
    description?: string;
    status?: EventStatus;
  }