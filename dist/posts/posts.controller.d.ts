import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(createPostDto: CreatePostDto): Promise<import("./entities/post.entity").Post>;
    findAll(paginationDto: PaginationDto): Promise<{
        images: string[];
        id: string;
        title?: string;
        slug?: string;
        description?: string;
        user: import("../auth/entities/user.entity").User;
        tags?: import("../tags/entities/tag.entity").Tag[];
    }[]>;
    findOne(term: string): Promise<import("./entities/post.entity").Post>;
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
}
