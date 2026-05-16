import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { AuthModule } from '../auth/auth.module';
import { ContentModerationService } from '../common/services/content-moderation.service';

@Module({
  imports: [AuthModule],
  controllers: [CommentsController],
  providers: [CommentsService, ContentModerationService],
  exports: [CommentsService],
})
export class CommentsModule {}
