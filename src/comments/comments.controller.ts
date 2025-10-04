import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ResponseBuilder } from '../common/responses/response-builder';

@Controller('comments')
@UseGuards(AuthGuard())
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @GetUser() user: User) {
    const comment = await this.commentsService.create(createCommentDto, user);
    return ResponseBuilder.created(comment, 'Comment created successfully');
  }

  @Get('post/:postId')
  async findByPost(@Param('postId') postId: string) {
    const comments = await this.commentsService.findByPostId(postId);
    return ResponseBuilder.success(comments, 'Comments retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const comment = await this.commentsService.findOne(id);
    return ResponseBuilder.success(comment, 'Comment retrieved successfully');
  }

  @Get(':id/replies')
  async getReplies(@Param('id') id: string) {
    const replies = await this.commentsService.getReplies(id);
    return ResponseBuilder.success(replies, 'Replies retrieved successfully');
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    const comment = await this.commentsService.update(id, updateCommentDto, user);
    return ResponseBuilder.updated(comment, 'Comment updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.commentsService.remove(id, user);
    return ResponseBuilder.deleted('Comment deleted successfully');
  }
}
