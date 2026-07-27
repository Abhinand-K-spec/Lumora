import type { LoginUserResponseDto } from "../../user/auth/dto/LoginUserResponseDto.js";

export interface IAppService {
    getCurrentUser(userId: string): Promise<LoginUserResponseDto["user"]>;
}