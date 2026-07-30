import express, { urlencoded } from 'express';
import type {Request, Response, NextFunction} from 'express';
import authRoutes from './modules/user/auth/routes/auth.routes.js';
import photographerAuthRoutes from './modules/photographer/auth/routes/auth.routes.js';
import adminAuthRoutes from './modules/admin/auth/routes/auth.routes.js';
import userManagementRoutes from './modules/admin/userManagement/routes/user.management.route.js';

import cors from 'cors';
import { AppError } from './shared/errors/AppError.js';
import cookieParser from 'cookie-parser';
import appRoutes from './modules/user/routes/user.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use(cookieParser());

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials:true,
}));

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
  });

app.use('/api/auth',authRoutes);
app.use('/api/photographer/auth', photographerAuthRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/app',appRoutes);
app.use('/api/admin/userManagement',userManagementRoutes)



app.use((req:Request,res:Response)=>{
    res.status(404).json({
        success : false,
        message : 'Route not found'
    })
});


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
});



export default app;