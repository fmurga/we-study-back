import { Module } from '@nestjs/common';
import { TagsModule } from './tags/tags.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PostsModule } from './posts/posts.module';
import { MaterialsModule } from './materials/materials.module';
import { LessonsModule } from './lessons/lessons.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { join } from 'path';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MessagesWsModule } from './messages-ws/messages-ws.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DATABASE,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TagsModule,
    PostsModule,
    MaterialsModule,
    LessonsModule,
    CommonModule,
    AuthModule,
    CloudinaryModule,
    MessagesWsModule,
  ],
  providers: [CloudinaryService],
})
export class AppModule {}
