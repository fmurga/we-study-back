import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../auth/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { ContentModerationService } from '../common/services/content-moderation.service';
import { ErrorHandlerFactory, ErrorCode } from '../common/errors/error-handler.factory';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly contentModerationService: ContentModerationService,
  ) { }

  async create(createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
    const { content, postId, parentCommentId } = createCommentDto;

    // Moderate content
    const moderationResult = this.contentModerationService.moderateContent(content);
    if (!moderationResult.isAppropriate) {
      ErrorHandlerFactory.createError({
        code: ErrorCode.VALIDATION_ERROR,
        message: `Comment rejected: ${moderationResult.reason}`,
        context: { flaggedWords: moderationResult.flaggedWords },
      });
    }

    // Verify post exists
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      ErrorHandlerFactory.createError({
        code: ErrorCode.NOT_FOUND,
        message: 'Post not found',
      });
    }

    // Verify parent comment exists if provided
    let parentComment = null;
    if (parentCommentId) {
      parentComment = await this.commentRepository.findOne({
        where: { id: parentCommentId },
      });
      if (!parentComment) {
        ErrorHandlerFactory.createError({
          code: ErrorCode.NOT_FOUND,
          message: 'Parent comment not found',
        });
      }
    }

    const comment = this.commentRepository.create({
      content,
      user,
      post,
      parentComment,
      parentCommentId,
    });

    return await this.commentRepository.save(comment);
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { post: { id: postId }, parentComment: null },
      relations: ['user', 'replies', 'replies.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post', 'parentComment', 'replies'],
    });

    if (!comment) {
      ErrorHandlerFactory.createError({
        code: ErrorCode.NOT_FOUND,
        message: 'Comment not found',
      });
    }

    return comment;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, user: User): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.user.id !== user.id) {
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
      comment.content = updateCommentDto.content;
      comment.isEdited = true;
    }

    return await this.commentRepository.save(comment);
  }

  async remove(id: string, user: User): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.user.id !== user.id && !user.roles.includes('admin')) {
      ErrorHandlerFactory.createError({
        code: ErrorCode.UNAUTHORIZED,
        message: 'You can only delete your own comments',
      });
    }

    await this.commentRepository.remove(comment);
  }

  async getReplies(commentId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: { parentComment: { id: commentId } },
      relations: ['user', 'replies'],
      order: { createdAt: 'ASC' },
    });
  }
}
