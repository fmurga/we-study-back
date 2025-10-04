import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { BaseRepository } from '../../common/repositories/base.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class PostRepository extends BaseRepository<Post> {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {
    super(postRepo);
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return await this.postRepo.findOne({ where: { slug } });
  }

  async findByUserId(userId: string): Promise<Post[]> {
    return await this.postRepo.find({ where: { user: { id: userId } } });
  }

  async createPost(createPostDto: CreatePostDto, user: User, imageUrl?: string): Promise<Post> {
    const postData = {
      ...createPostDto,
      user,
      ...(imageUrl && { image: imageUrl }),
    };

    const post = await this.create(postData);

    // Update slug after creation
    await this.postRepo.update(post.id, { slug: post.id });
    post.slug = post.id;

    return post;
  }
  async findWithPagination(skip: number, take: number): Promise<{ posts: Post[]; total: number }> {
    const [posts, total] = await this.postRepo.findAndCount({
      skip,
      take,
      relations: ['user'],
      order: { title: 'ASC' },
    });

    return { posts, total };
  }
}
