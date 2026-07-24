import type { LoginUserResponseDto } from "../../auth/dto/LoginUserResponseDto.js";

export interface IAppService {
    getCurrentUser(userId: string): Promise<LoginUserResponseDto["user"]>;
}