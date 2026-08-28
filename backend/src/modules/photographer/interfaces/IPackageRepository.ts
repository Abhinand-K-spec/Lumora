import type { IPackage } from '../../../shared/interfaces/IPackage.js';

export interface IPackageRepository {
    create(data: Partial<IPackage>): Promise<IPackage>;
    findById(id: string): Promise<IPackage | null>;
    update(id: string, data: Partial<IPackage>): Promise<IPackage | null>;
    delete(id: string): Promise<boolean>;
    findByPhotographerId(photographerId: string): Promise<IPackage[]>;
}
