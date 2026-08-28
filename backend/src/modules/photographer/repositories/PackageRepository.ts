import type { IPackageRepository } from '../interfaces/IPackageRepository.js';
import type { IPackage } from '../../../shared/interfaces/IPackage.js';
import Package from '../../../shared/models/package.model.js';

export class PackageRepository implements IPackageRepository {
    async create(data: Partial<IPackage>): Promise<IPackage> {
        return await Package.create(data);
    }

    async findById(id: string): Promise<IPackage | null> {
        return await Package.findById(id);
    }

    async update(id: string, data: Partial<IPackage>): Promise<IPackage | null> {
        return await Package.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await Package.findByIdAndDelete(id);
        return result !== null;
    }

    async findByPhotographerId(photographerId: string): Promise<IPackage[]> {
        return await Package.find({ photographerId });
    }
}
