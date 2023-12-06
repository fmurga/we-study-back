import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DataSource, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PostImage } from './entities/post-image.entity';
export declare class PostsService {
    private readonly postRepository;
    private readonly postImageRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(postRepository: Repository<Post>, postImageRepository: Repository<PostImage>, dataSource: DataSource);
    create(createPostDto: CreatePostDto): Promise<Post>;
    findAll(paginationDto: PaginationDto): Promise<{
        images: string[];
        id: string;
        title?: string;
        slug?: string;
        description?: string;
        user: import("../auth/entities/user.entity").User;
        tags?: import("../tags/entities/tag.entity").Tag[];
    }[]>;
    findOne(term: string): Promise<Post>;
    findOnePlain(term: string): Promise<{
        images: string[];
        id: string;
        title?: string;
        slug?: string;
        description?: string;
        user: import("../auth/entities/user.entity").User;
        tags?: import("../tags/entities/tag.entity").Tag[];
    }>;
    update(id: string, updatePostDto: UpdatePostDto): Promise<{
        images: string[];
        id: string;
        title?: string;
        slug?: string;
        description?: string;
        user: import("../auth/entities/user.entity").User;
        tags?: import("../tags/entities/tag.entity").Tag[];
    }>;
    remove(id: string): Promise<void>;
    deleteAllPosts(): Promise<import("typeorm").DeleteResult>;
    private handleDBExceptions;
}
