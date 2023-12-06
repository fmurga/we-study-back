import { Tag } from 'src/tags/entities/tag.entity';
import { PostImage } from './post-image.entity';
import { User } from 'src/auth/entities/user.entity';
export declare class Post {
    id: string;
    title?: string;
    slug?: string;
    description?: string;
    user: User;
    tags?: Tag[];
    images?: PostImage[];
    checkSlugInsert(): void;
    checkSlugUpdate(): void;
}
