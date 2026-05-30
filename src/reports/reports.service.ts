import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportDto, user: User) {
    const { reportType, description, postId, commentId } = dto;

    if (!postId && !commentId) {
      throw new BadRequestException('postId or commentId is required');
    }

    try {
      return await this.prisma.report.create({
        data: {
          reportType,
          description,
          reportedById: user.id,
          postId: postId ?? null,
          commentId: commentId ?? null,
        },
        select: { id: true, reportType: true, status: true, createdAt: true },
      });
    } catch (e: unknown) {
      if (
        e instanceof Error &&
        'code' in e &&
        (e as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('You have already reported this content');
      }
      throw e;
    }
  }
}
