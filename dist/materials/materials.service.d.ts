import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialsService {
    create(createMaterialDto: CreateMaterialDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateMaterialDto: UpdateMaterialDto): string;
    remove(id: number): string;
}
