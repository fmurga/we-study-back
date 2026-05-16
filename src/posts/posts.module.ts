import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PostsController],
  providers: [PostsService, CloudinaryService],
  imports: [AuthModule],
  exports: [PostsService],
})
export class PostsModule {}
