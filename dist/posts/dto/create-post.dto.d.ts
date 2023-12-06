import { Tag } from 'src/tags/entities/tag.entity';
export declare class CreatePostDto {
    title?: string;
    slug?: string;
    description: string;
    tags?: Tag[];
    images?: string[];
}
