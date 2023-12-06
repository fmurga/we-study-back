import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Post } from 'src/posts/entities/post.entity';
export declare class Tag {
    id: string;
    name: string;
    slug: string;
    status: string;
    posts: Post[];
    lessons: Lesson[];
}
