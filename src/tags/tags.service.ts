import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTagDto } from './dto/update-tag.dto';
import { isUUID } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  private readonly logger = new Logger('TagsService');

  constructor(private readonly prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto) {
    try {
      const title = createTagDto.title.toUpperCase();
      const slug = createTagDto.slug ?? title
        .toLowerCase()
        .replace(/[\s'"]+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

      return await this.prisma.tag.create({ data: { ...createTagDto, title, slug } });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.prisma.tag.findMany({
      take: limit,
      skip: offset,
      include: { posts: true },
    });
  }

  async findOne(term: string) {
    let tag: any;

    if (isUUID(term)) {
      tag = await this.prisma.tag.findUnique({ where: { id: term } });
    } else {
      tag = await this.prisma.tag.findFirst({
        where: {
          OR: [
            { title: { equals: term, mode: 'insensitive' } },
            { slug: term.toLowerCase() },
          ],
        },
      });
    }

    if (!tag) throw new NotFoundException(`Tag with ${term} not found`);
    return tag;
  }

  async findOnePlain(term: string) {
    return this.findOne(term);
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const exists = await this.prisma.tag.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException(`Tag with id: ${id} not found`);

    try {
      return await this.prisma.tag.update({ where: { id }, data: updateTagDto });
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.tag.delete({ where: { id } });
  }

  async deleteAllTags() {
    try {
      return await this.prisma.tag.deleteMany({});
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
