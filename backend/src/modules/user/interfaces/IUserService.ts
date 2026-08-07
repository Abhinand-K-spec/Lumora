import type { LoginUserResponseDto } from "../../auth/dto/LoginUserResponseDto.js";

export interface IUserService {
    getCurrentUser(userId: string): Promise<LoginUserResponseDto["user"]>;
}
