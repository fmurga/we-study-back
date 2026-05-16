import { Module } from '@nestjs/common';
import { UserFollowsService } from './user-follows.service';
import { UserFollowsController } from './user-follows.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UserFollowsController],
  providers: [UserFollowsService],
  exports: [UserFollowsService],
})
export class UserFollowsModule {}
