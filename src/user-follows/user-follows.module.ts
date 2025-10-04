import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFollowsService } from './user-follows.service';
import { UserFollowsController } from './user-follows.controller';
import { UserFollow } from './entities/user-follow.entity';
import { User } from '../auth/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserFollow, User]),
    AuthModule,
  ],
  controllers: [UserFollowsController],
  providers: [UserFollowsService],
  exports: [UserFollowsService],
})
export class UserFollowsModule { }
