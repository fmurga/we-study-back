import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TypesenseService } from '../typesense/typesense.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class PostsService {
  private readonly logger = new Logger('PostsService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly typesense: TypesenseService,
  ) {}

  async create(createPostDto: CreatePostDto, user: User, image?: any) {
    try {
      const { lessonId, tags, ...postData } = createPostDto as any;

      const data: any = {
        ...postData,
        userId: user.id,
      };

      if (image) data.image = image.secure_url;
      if (lessonId) data.lessonId = lessonId;

      const post = await this.prisma.post.create({ data, include: { user: true } });

      await this.prisma.post.update({
        where: { id: post.id },
        data: { slug: post.id },
      });

      await this.typesense.indexPost(post);

      return { ...post, slug: post.id };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.prisma.post.findMany({
      take: limit,
      skip: offset,
      include: { tags: true, user: true },
    });
  }

  async findByLesson(lessonId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.prisma.post.findMany({
      where: { lessonId },
      take: limit,
      skip: offset,
      include: { tags: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(term: string) {
    let post: any;

    if (isUUID(term)) {
      post = await this.prisma.post.findUnique({ where: { id: term } });
    } else {
      post = await this.prisma.post.findFirst({
        where: {
          OR: [
            { title: { equals: term, mode: 'insensitive' } },
            { slug: term.toLowerCase() },
          ],
        },
      });
    }

    if (!post) throw new NotFoundException(`Post with ${term} not found`);
    return post;
  }

  async findOnePlain(term: string) {
    return this.findOne(term);
  }

  async update(id: string, updatePostDto: UpdatePostDto, file?: any) {
    if (file) updatePostDto.image = file.secure_url;

    const exists = await this.prisma.post.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Post with id: ${id} not found`);

    try {
      const updated = await this.prisma.post.update({
        where: { id },
        data: updatePostDto as any,
        include: { user: true },
      });
      await this.typesense.indexPost(updated);
      return updated;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.post.delete({ where: { id } });
    await this.typesense.deletePost(id);
  }

  async deleteAllPosts() {
    try {
      return await this.prisma.post.deleteMany({});
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
