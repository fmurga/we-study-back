import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
export declare class MaterialsController {
    private readonly materialsService;
    constructor(materialsService: MaterialsService);
    create(createMaterialDto: CreateMaterialDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateMaterialDto: UpdateMaterialDto): string;
    remove(id: string): string;
}
