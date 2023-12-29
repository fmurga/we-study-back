import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class PostsService {
  private readonly logger = new Logger('PostsService');

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createPostDto: CreatePostDto, user: User, image?: any) {
    try {
      if (image) {
        const post = this.postRepository.create({
          ...createPostDto,
          image: image.secure_url,
          user,
        });
        await this.postRepository.save(post);
        return post;
      }
      const post = this.postRepository.create({
        ...createPostDto,
        user,
      });
      await this.postRepository.save(post);
      await this.postRepository.update(post.id, { slug: post.id });
      post.slug = post.id;
      return post;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const posts = await this.postRepository.find({
      take: limit,
      skip: offset,
      relations: ['tags'],
    });
    return posts.map((post) => ({
      ...post,
    }));
  }

  async findOne(term: string) {
    let post: Post;
    if (isUUID(term)) {
      post = await this.postRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.postRepository.createQueryBuilder();
      post = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .getOne();
    }

    if (!post) throw new NotFoundException(`Post with ${term} not found`);

    return post;
  }

  async findOnePlain(term: string) {
    const { ...rest } = await this.findOne(term);
    return {
      ...rest,
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto, file?: any) {
    if (file) {
      updatePostDto.image = file.secure_url;
    }
    const { ...toUpdate } = updatePostDto;
    console.log('to update', updatePostDto);
    const post = await this.postRepository.preload({ id, ...toUpdate });
    console.log('post updated', post);
    if (!post) throw new NotFoundException(`Post with id: ${id} not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(post);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }

  async deleteAllPosts() {
    const query = this.postRepository.createQueryBuilder('posts');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
