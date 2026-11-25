export interface CreateEventDTO {
    bookingId: string;
    name: string;
    description?: string;
}

export interface UpdateEventDTO {
    name?: string;
    description?: string;
}