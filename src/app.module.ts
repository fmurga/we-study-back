import { Module } from '@nestjs/common';
import { TagsModule } from './tags/tags.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { CommentsModule } from './comments/comments.module';
import { UserFollowsModule } from './user-follows/user-follows.module';
import { FavouritesModule } from './favourites/favourites.module';
import { DatabaseConfigFactory } from './config/database.config';
import { CalendarModule } from './calendar/calendar.module';
import { NotesModule } from './notes/notes.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        DatabaseConfigFactory.createTypeOrmOptions(configService),
      inject: [ConfigService],
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
    CommentsModule,
    UserFollowsModule,
    FavouritesModule,
    CalendarModule,
    NotesModule,
    ReportsModule,
  ],
  providers: [CloudinaryService],
})
export class AppModule { }
