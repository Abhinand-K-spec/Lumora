import type { IUser } from "../../../../shared/interfaces/IUser.js";
import type { IPhotographer } from "../../../../shared/interfaces/IPhotographer.js";
import type { LoginUserResponseDto } from "./LoginUserResponseDto.js";

export class UserMapper {

    static toLoginResponseUser(
        user: IUser | IPhotographer
    ): LoginUserResponseDto["user"] {

        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
        };
    }

}
