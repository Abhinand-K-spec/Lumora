import type { IUser } from "../../../interfaces/IUser.js";
import type { LoginUserResponseDto } from "./LoginUserResponseDto.js";

export class UserMapper {

    static toLoginResponseUser(
        user: IUser
    ): LoginUserResponseDto["user"] {

        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
        };
    }

}