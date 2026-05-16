import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ContentModerationService } from '../common/services/content-moderation.service';
import { ErrorHandlerFactory, ErrorCode } from '../common/errors/error-handler.factory';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contentModerationService: ContentModerationService,
  ) {}

  async create(createCommentDto: CreateCommentDto, user: User) {
    const { content, postId, parentCommentId } = createCommentDto;

    const moderationResult = this.contentModerationService.moderateContent(content);
    if (!moderationResult.isAppropriate) {
      ErrorHandlerFactory.createError({
        code: ErrorCode.VALIDATION_ERROR,
        message: `Comment rejected: ${moderationResult.reason}`,
        context: { flaggedWords: moderationResult.flaggedWords },
      });
    }

    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      ErrorHandlerFactory.createError({ code: ErrorCode.NOT_FOUND, message: 'Post not found' });
    }

    if (parentCommentId) {
      const parentComment = await this.prisma.comment.findUnique({ where: { id: parentCommentId } });
      if (!parentComment) {
        ErrorHandlerFactory.createError({ code: ErrorCode.NOT_FOUND, message: 'Parent comment not found' });
      }
    }

    return this.prisma.comment.create({
      data: {
        content,
        userId: user.id,
        postId,
        parentCommentId: parentCommentId ?? null,
      },
    });
  }

  async findByPostId(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId, parentCommentId: null },
      include: {
        user: true,
        replies: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { user: true, post: true, parentComment: true, replies: true },
    });

    if (!comment) {
      ErrorHandlerFactory.createError({ code: ErrorCode.NOT_FOUND, message: 'Comment not found' });
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, user: User) {
    const comment = await this.findOne(id);

    if (comment.userId !== user.id) {
      ErrorHandlerFactory.createError({
        code: ErrorCode.UNAUTHORIZED,
        message: 'You can only edit your own comments',
      });
    }

    if (updateCommentDto.content) {
      const moderationResult = this.contentModerationService.moderateContent(updateCommentDto.content);
      if (!moderationResult.isAppropriate) {
        ErrorHandlerFactory.createError({
          code: ErrorCode.VALIDATION_ERROR,
          message: `Comment rejected: ${moderationResult.reason}`,
          context: { flaggedWords: moderationResult.flaggedWords },
        });
      }
    }

    return this.prisma.comment.update({
      where: { id },
      data: {
        content: updateCommentDto.content,
        isEdited: true,
      },
    });
  }

  async remove(id: string, user: User) {
    const comment = await this.findOne(id);

    if (comment.userId !== user.id && !user.roles.includes('admin')) {
      ErrorHandlerFactory.createError({
        code: ErrorCode.UNAUTHORIZED,
        message: 'You can only delete your own comments',
      });
    }

    await this.prisma.comment.delete({ where: { id } });
  }

  async getReplies(commentId: string) {
    return this.prisma.comment.findMany({
      where: { parentCommentId: commentId },
      include: { user: true, replies: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
