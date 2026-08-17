import type { IBaseRepository } from "./IBaseRepository";
import type { Model } from 'mongoose';

export abstract class BaseRepository<T> implements IBaseRepository<T> {
    constructor(
        protected readonly _model: Model<T>
    ) {}

    async find(): Promise<T[]> {
        return await this._model.find();
    }

    async create(data: Partial<T>): Promise<T> {
        return await this._model.create(data);
    }

    async findById(id: string): Promise<T | null> {
        return await this._model.findById(id);
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        return await this._model.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );
    }
}