export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePhoto: string;
}

export interface UpdateProfileRequest {
    name?: string;
    phone?: string;
    profilePhoto?: string;
}