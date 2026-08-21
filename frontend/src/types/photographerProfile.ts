export interface PhotographerProfile {
    id: string;
    name: string;
    bio:string;
    email: string;
    phone: string;
    profilePhoto: string;
}

export interface UpdatePhotographerProfileRequest {
    name?: string;
    phone?: string;
    profilePhoto?: string;
    bio?:string;
}