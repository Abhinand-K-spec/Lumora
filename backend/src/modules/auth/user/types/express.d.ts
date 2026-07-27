import { JwtPayload } from "jsonwebtoken";

import type { AuthPayload } from "./authPayload.ts";



declare global {

    namespace Express {

        interface Request {

            user?: AuthPayload;

        }

    }

}



export {};