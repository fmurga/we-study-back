import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { Repository } from 'typeorm';
export declare class TagsService {
    private readonly tagRepository;
    private readonly logger;
    constructor(tagRepository: Repository<Tag>);
    create(createTagDto: CreateTagDto): Promise<Tag>;
    findAll(): Promise<Tag[]>;
    findOne(id: number): string;
    update(id: number, updateTagDto: UpdateTagDto): string;
    remove(id: number): string;
}
