import { Post } from 'src/posts/entities/post.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    fullName: string;
    username: string;
    isActive: boolean;
    roles: string[];
    posts: Post[];
    checkFieldsBeforeInsert(): void;
    checkFieldsBeforeUpdate(): void;
}
