import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { LessonsModule } from './lessons/lessons.module';
import { CommentsModule } from './comments/comments.module';
import { TagsModule } from './tags/tags.module';
import { NotesModule } from './notes/notes.module';
import { CalendarModule } from './calendar/calendar.module';
import { FavouritesModule } from './favourites/favourites.module';
import { UserFollowsModule } from './user-follows/user-follows.module';
import { ReportsModule } from './reports/reports.module';
import { MaterialsModule } from './materials/materials.module';
import { MessagesWsModule } from './messages-ws/messages-ws.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CommonModule } from './common/common.module';
import { TypesenseModule } from './typesense/typesense.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    PrismaModule,
    AuthModule,
    PostsModule,
    LessonsModule,
    CommentsModule,
    TagsModule,
    NotesModule,
    CalendarModule,
    FavouritesModule,
    UserFollowsModule,
    ReportsModule,
    MaterialsModule,
    MessagesWsModule,
    CloudinaryModule,
    CommonModule,
    TypesenseModule,
    SearchModule,
  ],
})
export class AppModule {}
