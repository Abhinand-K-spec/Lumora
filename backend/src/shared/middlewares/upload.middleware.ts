import multer, { type Multer } from 'multer';
import { AppError } from '../errors/AppError';
import { HttpStatus } from '../enums/HTTP.status.code';

const storage = multer.memoryStorage();


const fileFilter = (req:Express.Request,file:Express.Multer.File, cb:multer.FileFilterCallback)=>{
    if(file.mimetype.startsWith('image/')){
        cb(null,true);
    }else{
        cb(new AppError(HttpStatus.BAD_REQUEST,'Only images are allowed'));
    }
};

export const uploadProfilePhoto = multer({
    storage,
    fileFilter,
    limits:{fileSize:2*1024*1024}
})