import { Post } from 'src/posts/entities/post.entity';
export declare class CreateTagDto {
    name: string;
    slug?: string;
    status?: string;
    readonly posts: Post[];
}
