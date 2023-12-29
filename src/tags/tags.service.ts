import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTagDto } from './dto/update-tag.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  private readonly logger = new Logger('TagsService');

  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createTagDto: CreateTagDto) {
    try {
      const tag = this.tagsRepository.create(createTagDto);
      await this.tagsRepository.save(tag);
      return tag;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const tags = await this.tagsRepository.find({
      take: limit,
      skip: offset,
      relations: ['posts'],
    });
    return tags.map((tag) => ({
      ...tag,
    }));
  }

  async findOne(term: string) {
    let tag: Tag;
    if (isUUID(term)) {
      tag = await this.tagsRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.tagsRepository.createQueryBuilder();
      tag = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .getOne();
    }

    if (!tag) throw new NotFoundException(`Tag with ${term} not found`);

    return tag;
  }

  async findOnePlain(term: string) {
    const { ...rest } = await this.findOne(term);
    return {
      ...rest,
    };
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const { ...toUpdate } = updateTagDto;

    const tag = await this.tagsRepository.preload({ id, ...toUpdate });

    if (!tag) throw new NotFoundException(`Tag with id: ${id} not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(tag);

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
    const tag = await this.findOne(id);
    await this.tagsRepository.remove(tag);
  }

  async deleteAllTags() {
    const query = this.tagsRepository.createQueryBuilder('tags');

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
