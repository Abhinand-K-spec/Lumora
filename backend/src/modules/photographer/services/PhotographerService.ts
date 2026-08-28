import { AUTH_MESSAGES } from "../../../shared/constants/message.constant.js";
import { HttpStatus } from "../../../shared/enums/HTTP.status.code.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { IPhotographer } from "../../../shared/interfaces/IPhotographer.js";
import type { IUserRepository } from "../../auth/interfaces/IUserRepository.js";
import type { editPhotographerProfileDto } from "../dto/editPhotographerProfileDto.js";
import { photographerProfileMapper } from "../dto/photographerProfileMapper.js";
import type { photographerProfileResponseDto } from "../dto/photographerProfileResponseDto.js";
import type { IPhotographerService } from "../interfaces/IPhotographerService.js";
import type { IPhotographerRepository } from "../repositories/IPhotographerRepository.js";
import type { IPackageRepository } from "../interfaces/IPackageRepository.js";
import type { IPackage } from "../../../shared/interfaces/IPackage.js";

export class PhotographerService implements IPhotographerService {
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _photographerRepository: IPhotographerRepository,
        private readonly _packageRepository: IPackageRepository
    ) { }


    async getProfile(userId: string): Promise<photographerProfileResponseDto> {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        }

        const profile = await this._photographerRepository.findByUserId(userId);

        if (!profile) {
            throw new AppError(HttpStatus.BAD_REQUEST, 'No profile found');
        }

        const packages = await this._packageRepository.findByPhotographerId(profile._id.toString());
        return photographerProfileMapper.toProfileResponse(user, profile, packages);
    }

    async getPhotographers(filters: { search?: string | undefined; district?: string | undefined; service?: string | undefined; price?: string | undefined; }): Promise<photographerProfileResponseDto[]> {
        const query: any = {};

        // 1. Filter by location (District)
        if (filters.district) {
            query.location = { $regex: new RegExp(filters.district, 'i') };
        }

        // 2. Filter by specialities (Service)
        if (filters.service) {
            query.specialities = { $regex: new RegExp(filters.service, 'i') };
        }

        // 3. Filter by search term
        if (filters.search) {
            const matchingUsers = await this._userRepository.findWithFilter({
                name: { $regex: new RegExp(filters.search, 'i') }
            });
            const matchingUserIds = matchingUsers.map(u => u._id.toString());

            query.$or = [
                { userId: { $in: matchingUserIds } },
                { location: { $regex: new RegExp(filters.search, 'i') } },
                { specialities: { $regex: new RegExp(filters.search, 'i') } },
                { bio: { $regex: new RegExp(filters.search, 'i') } }
            ];
        }

        // 4. Fetch matching photographer profiles
        let photographers = await this._photographerRepository.findAll(query);

        // 5. Filter by price tier if requested
        if (filters.price) {
            let minPrice = 0;
            let maxPrice = Infinity;

            if (filters.price === '₹') {
                maxPrice = 15000;
            } else if (filters.price === '₹₹') {
                minPrice = 15000;
                maxPrice = 30000;
            } else if (filters.price === '₹₹₹') {
                minPrice = 30000;
                maxPrice = 60000;
            } else if (filters.price === '₹₹₹₹') {
                minPrice = 60000;
            }

            const filteredPhotographers: typeof photographers = [];
            for (const pg of photographers) {
                const pkgs = await this._packageRepository.findByPhotographerId(pg._id.toString());
                const activePkgs = pkgs.filter(p => p.status === 'active');
                if (activePkgs.length > 0) {
                    const startsAt = Math.min(...activePkgs.map(p => p.price));
                    if (startsAt >= minPrice && startsAt < maxPrice) {
                        filteredPhotographers.push(pg);
                    }
                }
            }
            photographers = filteredPhotographers;
        }

        // 6. Map to DTOs
        const dtos: photographerProfileResponseDto[] = [];
        for (const pg of photographers) {
            const user = await this._userRepository.findById(pg.userId);
            if (user) {
                const packages = await this._packageRepository.findByPhotographerId(pg._id.toString());
                dtos.push(photographerProfileMapper.toProfileResponse(user, pg, packages));
            }
        }

        return dtos;
    }


    async editProfile(userId: string, data: editPhotographerProfileDto): Promise<photographerProfileResponseDto> {
        let user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        }

        if (data.name !== undefined) {
            user = await this._userRepository.update(userId, { name: data.name });
        }

        let profile = await this._photographerRepository.findByUserId(userId);

        if (!profile) {
            profile = await this._photographerRepository.create({
                userId,
                bio: data.bio || "",
                phone: data.phone || "",
                profilePhoto: data.profilePhoto || "",
                coverPhoto: data.coverPhoto || "",
                location: data.location || "",
                languages: data.languages || [],
                specialities: data.specialities || [],
                equipment: data.equipment || [],
                serviceRegions: data.serviceRegions || []
            });
        } else {
            const profileData: Partial<IPhotographer> = {};

            if (data.bio !== undefined) profileData.bio = data.bio;
            if (data.phone !== undefined) profileData.phone = data.phone;
            if (data.profilePhoto !== undefined) profileData.profilePhoto = data.profilePhoto;
            if (data.coverPhoto !== undefined) profileData.coverPhoto = data.coverPhoto;
            if (data.location !== undefined) profileData.location = data.location;
            if (data.languages !== undefined) profileData.languages = data.languages;
            if (data.specialities !== undefined) profileData.specialities = data.specialities;
            if (data.equipment !== undefined) profileData.equipment = data.equipment;
            if (data.serviceRegions !== undefined) profileData.serviceRegions = data.serviceRegions;

            profile = await this._photographerRepository.update(profile._id.toString(), profileData);
        }
        const packages = await this._packageRepository.findByPhotographerId(profile!._id.toString());
        return photographerProfileMapper.toProfileResponse(user!, profile!, packages);
    }

    async addPackage(userId: string, data: {
        packageName: string;
        price: number;
        description: string;
        framesIncluded: boolean;
        droneIncluded: boolean;
        albumIncluded: boolean;
        status: string;
        videographersIncluded: boolean;
    }): Promise<photographerProfileResponseDto> {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        }

        let profile = await this._photographerRepository.findByUserId(userId);
        if (!profile) {
            profile = await this._photographerRepository.create({
                userId,
                bio: "",
                phone: "",
                profilePhoto: "",
                coverPhoto: "",
                location: "",
                languages: [],
                specialities: [],
                equipment: [],
                serviceRegions: []
            });
        }

        await this._packageRepository.create({
            photographerId: profile._id,
            packageName: data.packageName,
            price: data.price,
            description: data.description,
            framesIncluded: data.framesIncluded,
            droneIncluded: data.droneIncluded,
            albumIncluded: data.albumIncluded,
            videographersIncluded: data.videographersIncluded,
            status: data.status
        });

        const packages = await this._packageRepository.findByPhotographerId(profile._id.toString());
        return photographerProfileMapper.toProfileResponse(user, profile, packages);
    }

    async editPackage(userId: string, packageId: string, data: {
        packageName: string;
        price: number;
        description: string;
        framesIncluded: boolean;
        droneIncluded: boolean;
        albumIncluded: boolean;
        status: string;
        videographersIncluded: boolean;
    }): Promise<photographerProfileResponseDto> {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        }

        const profile = await this._photographerRepository.findByUserId(userId);
        if (!profile) {
            throw new AppError(HttpStatus.BAD_REQUEST, 'No profile found');
        }

        const pkg = await this._packageRepository.findById(packageId);
        if (!pkg || pkg.photographerId.toString() !== profile._id.toString()) {
            throw new AppError(HttpStatus.BAD_REQUEST, 'Package not found or unauthorized');
        }

        await this._packageRepository.update(packageId, {
            packageName: data.packageName,
            price: data.price,
            description: data.description,
            framesIncluded: data.framesIncluded,
            droneIncluded: data.droneIncluded,
            albumIncluded: data.albumIncluded,
            videographersIncluded: data.videographersIncluded,
            status: data.status
        });

        const packages = await this._packageRepository.findByPhotographerId(profile._id.toString());
        return photographerProfileMapper.toProfileResponse(user, profile, packages);
    }

    async deletePackage(userId: string, packageId: string): Promise<photographerProfileResponseDto> {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(HttpStatus.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);
        }

        const profile = await this._photographerRepository.findByUserId(userId);
        if (!profile) {
            throw new AppError(HttpStatus.BAD_REQUEST, 'No profile found');
        }

        const pkg = await this._packageRepository.findById(packageId);
        if (!pkg || pkg.photographerId.toString() !== profile._id.toString()) {
            throw new AppError(HttpStatus.BAD_REQUEST, 'Package not found or unauthorized');
        }

        await this._packageRepository.delete(packageId);

        const packages = await this._packageRepository.findByPhotographerId(profile._id.toString());
        return photographerProfileMapper.toProfileResponse(user, profile, packages);
    }

}