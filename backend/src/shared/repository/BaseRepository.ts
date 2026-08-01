import type { IBaseRepository } from "./IBaseRepository";
import type {Model, Document} from 'mongoose';

export abstract class BaseRepository<T> implements IBaseRepository<T>{
    constructor(
        private readonly _model: Model<T>
    ){}

    async find():Promise<T[]>{
        return await this._model.find();
    }


    async create(data: Partial<T>):Promise <T>{
        return await this._model.create(data);
    }

    async findById(id: string): Promise<T | null> {
        return await this._model.findById(id);
    }

    async exists(email: string): Promise<boolean> {
        const data = await this._model.findOne({ email });
    
        return !!data;
        }

}