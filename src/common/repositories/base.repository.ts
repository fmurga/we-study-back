import { DeepPartial, Repository } from 'typeorm';

export interface IBaseRepository<T> {
  create(entityData: DeepPartial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(skip?: number, take?: number): Promise<T[]>;
  update(id: string, updateData: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}

export abstract class BaseRepository<T extends { id: string }> implements IBaseRepository<T> {
  protected constructor(protected repository: Repository<T>) { }

  async create(entityData: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(entityData);
    return await this.repository.save(entity);
  }

  async findById(id: string): Promise<T | null> {
    return await this.repository.findOne({ where: { id } as any });
  }

  async findAll(skip?: number, take?: number): Promise<T[]> {
    return await this.repository.find({ skip, take });
  }

  async update(id: string, updateData: Partial<T>): Promise<T | null> {
    await this.repository.update(id, updateData as any);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async exists(id: string): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }
}
