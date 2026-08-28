import { Types } from 'mongoose';

export interface IPackage {
    _id: Types.ObjectId;
    description: string;
    packageName: string;
    photographerId: Types.ObjectId;
    price: number;
    framesIncluded: boolean;
    droneIncluded: boolean;
    albumIncluded: boolean;
    status: string;
    videographersIncluded: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
