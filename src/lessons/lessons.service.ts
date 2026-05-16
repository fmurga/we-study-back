import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TypesenseService } from '../typesense/typesense.service';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger('LessonsService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly typesense: TypesenseService,
  ) {}

  async create(createLessonDto: CreateLessonDto, file?: any) {
    try {
      const { tags = [], ...lessonDetails } = createLessonDto;

      if (file) lessonDetails.image = file.secure_url;

      const lesson = await this.prisma.lesson.create({
        data: {
          ...lessonDetails,
          tags: tags.length > 0 ? { connect: tags.map((id: string) => ({ id })) } : undefined,
        },
        include: { tags: true, posts: true, notes: true },
      });

      await this.typesense.indexLesson(lesson);
      return { ...lesson, postsCount: lesson.posts.length, notesCount: lesson.notes.length };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const lessons = await this.prisma.lesson.findMany({
      take: limit,
      skip: offset,
      include: { tags: true, posts: true },
      orderBy: { createdAt: 'desc' },
    });

    return lessons.map((lesson) => ({ ...lesson, postsCount: lesson.posts.length }));
  }

  async findOne(term: string) {
    let lesson: any;

    if (isUUID(term)) {
      lesson = await this.prisma.lesson.findUnique({
        where: { id: term },
        include: { tags: true, posts: true, notes: true },
      });
    } else {
      lesson = await this.prisma.lesson.findFirst({
        where: { name: { equals: term, mode: 'insensitive' } },
        include: { tags: true, posts: true, notes: true },
      });
    }

    if (!lesson) throw new NotFoundException(`Lesson with ${term} not found`);
    return lesson;
  }

  async findOnePlain(term: string) {
    const lesson = await this.findOne(term);
    return {
      ...lesson,
      postsCount: lesson.posts?.length ?? 0,
      notesCount: lesson.notes?.length ?? 0,
    };
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, file?: any) {
    const { tags, ...toUpdate } = updateLessonDto;

    if (file) toUpdate.image = file.secure_url;

    const exists = await this.prisma.lesson.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Lesson with id: ${id} not found`);

    try {
      const updated = await this.prisma.lesson.update({
        where: { id },
        data: {
          ...toUpdate,
          tags: tags ? { set: tags.map((tagId: string) => ({ id: tagId })) } : undefined,
        },
      });

      await this.typesense.indexLesson(updated);
      return this.findOnePlain(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.lesson.delete({ where: { id } });
    await this.typesense.deleteLesson(id);
  }

  async findByTag(tagId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const lessons = await this.prisma.lesson.findMany({
      where: { tags: { some: { id: tagId } } },
      take: limit,
      skip: offset,
      include: { tags: true, posts: true },
      orderBy: { createdAt: 'desc' },
    });

    return lessons.map((lesson) => ({ ...lesson, postsCount: lesson.posts.length }));
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
