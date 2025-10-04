import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Tag } from '../tags/entities/tag.entity';

@Injectable()
export class LessonsService {
  private readonly logger = new Logger('LessonsService');

  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly dataSource: DataSource,
  ) { }

  async create(createLessonDto: CreateLessonDto, file?: any) {
    try {
      const { tags = [], ...lessonDetails } = createLessonDto;

      if (file) {
        lessonDetails.image = file.secure_url;
      }

      const lesson = this.lessonRepository.create(lessonDetails);

      if (tags.length > 0) {
        lesson.tags = await this.tagRepository.findByIds(tags);
      }

      await this.lessonRepository.save(lesson);
      return this.findOnePlain(lesson.id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const lessons = await this.lessonRepository.find({
      take: limit,
      skip: offset,
      relations: ['tags', 'posts'],
      order: { createdAt: 'DESC' },
    });

    return lessons.map((lesson) => ({
      ...lesson,
      postsCount: lesson.posts?.length || 0,
    }));
  }

  async findOne(term: string) {
    let lesson: Lesson;
    if (isUUID(term)) {
      lesson = await this.lessonRepository.findOne({
        where: { id: term },
        relations: ['tags', 'posts', 'notes'],
      });
    } else {
      const queryBuilder = this.lessonRepository.createQueryBuilder('lesson');
      lesson = await queryBuilder
        .leftJoinAndSelect('lesson.tags', 'tags')
        .leftJoinAndSelect('lesson.posts', 'posts')
        .leftJoinAndSelect('lesson.notes', 'notes')
        .where('UPPER(lesson.name) = :name', {
          name: term.toUpperCase(),
        })
        .getOne();
    }

    if (!lesson) throw new NotFoundException(`Lesson with ${term} not found`);
    return lesson;
  }

  async findOnePlain(term: string) {
    const lesson = await this.findOne(term);
    return {
      ...lesson,
      postsCount: lesson.posts?.length || 0,
      notesCount: lesson.notes?.length || 0,
    };
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, file?: any) {
    const { tags, ...toUpdate } = updateLessonDto;

    if (file) {
      toUpdate.image = file.secure_url;
    }

    const lesson = await this.lessonRepository.preload({ id, ...toUpdate });

    if (!lesson) throw new NotFoundException(`Lesson with id: ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (tags) {
        lesson.tags = await this.tagRepository.findByIds(tags);
      }

      await queryRunner.manager.save(lesson);
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
    const lesson = await this.findOne(id);
    await this.lessonRepository.remove(lesson);
  }

  async findByTag(tagId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const lessons = await this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.tags', 'tag')
      .leftJoinAndSelect('lesson.posts', 'posts')
      .where('tag.id = :tagId', { tagId })
      .take(limit)
      .skip(offset)
      .orderBy('lesson.createdAt', 'DESC')
      .getMany();

    return lessons.map((lesson) => ({
      ...lesson,
      postsCount: lesson.posts?.length || 0,
    }));
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
