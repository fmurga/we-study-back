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
import { PostImage } from './entities/post-image.entity';

@Injectable()
export class PostsService {
  private readonly logger = new Logger('PostsService');

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Post)
    private readonly postImageRepository: Repository<PostImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createPostDto: CreatePostDto) {
    try {
      const { images = [], ...postDetails } = createPostDto;
      const post = this.postRepository.create({
        ...postDetails,
        images: images.map((image) =>
          this.postImageRepository.create({ url: image }),
        ),
      });
      await this.postRepository.save(post);
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
      relations: {
        images: true,
      },
    });
    return posts.map((post) => ({
      ...post,
      images: post.images.map((img) => img.url),
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
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const { images, ...toUpdate } = updatePostDto;

    const post = await this.postRepository.preload({ id, ...toUpdate });

    if (!post) throw new NotFoundException(`Post with id: ${id} not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(PostImage, { post: { id } });

        post.images = images.map((image) =>
          this.postImageRepository.create({ url: image }),
        );
      }

      // await this.postRepository.save( post );
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
    const query = this.postRepository.createQueryBuilder('post');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    // console.log(error)
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
