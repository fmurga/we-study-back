import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserFollowsService } from './user-follows.service';
import { CreateUserFollowDto } from './dto/create-user-follow.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ResponseBuilder } from '../common/responses/response-builder';

@Controller('user-follows')
@UseGuards(AuthGuard())
export class UserFollowsController {
  constructor(private readonly userFollowsService: UserFollowsService) { }

  @Post()
  async follow(@Body() createUserFollowDto: CreateUserFollowDto, @GetUser() user: User) {
    const follow = await this.userFollowsService.followUser(createUserFollowDto, user);
    return ResponseBuilder.created(follow, 'User followed successfully');
  }

  @Delete(':id')
  async unfollow(@Param('id') followingId: string, @GetUser() user: User) {
    await this.userFollowsService.unfollowUser(followingId, user);
    return ResponseBuilder.deleted('User unfollowed successfully');
  }

  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    const followers = await this.userFollowsService.getFollowers(userId);
    return ResponseBuilder.success(followers, 'Followers retrieved successfully');
  }

  @Get('following/:userId')
  async getFollowing(@Param('userId') userId: string) {
    const following = await this.userFollowsService.getFollowing(userId);
    return ResponseBuilder.success(following, 'Following retrieved successfully');
  }

  @Get('stats/:userId')
  async getFollowStats(@Param('userId') userId: string) {
    const stats = await this.userFollowsService.getFollowStats(userId);
    return ResponseBuilder.success(stats, 'Follow stats retrieved successfully');
  }

  @Get('is-following/:userId')
  async isFollowing(@Param('userId') userId: string, @GetUser() user: User) {
    const isFollowing = await this.userFollowsService.isFollowing(user.id, userId);
    return ResponseBuilder.success({ isFollowing }, 'Follow status retrieved successfully');
  }
}
