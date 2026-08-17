export interface IBaseRepository<T> {
    find(): Promise<T[]>;

    create(data: Partial<T>): Promise<T>;

    findById(id: string): Promise<T | null>;

    update(id: string, data: Partial<T>): Promise<T | null>;
}