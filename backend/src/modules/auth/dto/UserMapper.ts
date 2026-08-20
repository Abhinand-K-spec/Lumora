import type { IUsers } from "../../../shared/interfaces/IUsers.js";
import type { LoginUserResponseDto } from "./LoginUserResponseDto.js";

export class UserMapper {

    static toLoginResponseUser(
        user: IUsers
    ): LoginUserResponseDto["user"] {
        const u = user as IUsers;
        return {
            id: u._id.toString(),
            name: u.name,
            email: u.email,
            role: u.role
        };
    }

}
