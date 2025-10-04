import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from './entities/lesson.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from '../tags/entities/tag.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [LessonsController],
  providers: [LessonsService],
  imports: [TypeOrmModule.forFeature([Lesson, Tag]), CloudinaryModule],
})
export class LessonsModule { }
