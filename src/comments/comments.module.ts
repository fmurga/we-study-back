import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { AuthModule } from '../auth/auth.module';
import { ContentModerationService } from '../common/services/content-moderation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post]),
    AuthModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService, ContentModerationService],
  exports: [CommentsService],
})
export class CommentsModule { }
