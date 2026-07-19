import express, { urlencoded } from 'express';
import type {Request, Response, NextFunction} from 'express';
import authRoutes from './modules/auth/routes/auth.routes.js';


const app = express();

app.use(express.json());

app.use(express.urlencoded({extended:true}));


app.use('/api/auth',authRoutes);


app.use((req:Request,res:Response)=>{
    res.status(404).json({
        success : false,
        messagr : 'Route not found'
    })
});



app.use((err:Error,req:Request,res:Response,next:NextFunction)=>{
    console.log(err);


    res.status(500).json({
        success:false,
        message:err.message
    })
})



export default app;