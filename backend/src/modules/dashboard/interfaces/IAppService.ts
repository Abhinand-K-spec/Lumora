import type { LoginUserResponseDto } from "../../auth/user/dto/LoginUserResponseDto.js";

export interface IAppService {
    getCurrentUser(userId: string): Promise<LoginUserResponseDto["user"]>;
}