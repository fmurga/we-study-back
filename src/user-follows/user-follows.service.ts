import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFollow } from './entities/user-follow.entity';
import { User } from '../auth/entities/user.entity';
import { CreateUserFollowDto } from './dto/create-user-follow.dto';
import { ErrorHandlerFactory, ErrorCode } from '../common/errors/error-handler.factory';

@Injectable()
export class UserFollowsService {
  constructor(
    @InjectRepository(UserFollow)
    private readonly userFollowRepository: Repository<UserFollow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async followUser(createUserFollowDto: CreateUserFollowDto, follower: User): Promise<UserFollow> {
    const { followingId } = createUserFollowDto;

    if (follower.id === followingId) {
      ErrorHandlerFactory.createError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'You cannot follow yourself',
      });
    }

    const userToFollow = await this.userRepository.findOne({ where: { id: followingId } });
    if (!userToFollow) {
      ErrorHandlerFactory.createError({
        code: ErrorCode.NOT_FOUND,
        message: 'User not found',
      });
    }

    // Check if already following
    const existingFollow = await this.userFollowRepository.findOne({
      where: { followerId: follower.id, followingId },
    });

    if (existingFollow) {
      ErrorHandlerFactory.createError({
        code: ErrorCode.CONFLICT,
        message: 'Already following this user',
      });
    }

    const userFollow = this.userFollowRepository.create({
      follower,
      following: userToFollow,
      followerId: follower.id,
      followingId,
    });

    return await this.userFollowRepository.save(userFollow);
  }

  async unfollowUser(followingId: string, follower: User): Promise<void> {
    const userFollow = await this.userFollowRepository.findOne({
      where: { followerId: follower.id, followingId },
    });

    if (!userFollow) {
      ErrorHandlerFactory.createError({
        code: ErrorCode.NOT_FOUND,
        message: 'You are not following this user',
      });
    }

    await this.userFollowRepository.remove(userFollow);
  }

  async getFollowers(userId: string): Promise<User[]> {
    const follows = await this.userFollowRepository.find({
      where: { followingId: userId },
      relations: ['follower'],
    });

    return follows.map(follow => follow.follower);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const follows = await this.userFollowRepository.find({
      where: { followerId: userId },
      relations: ['following'],
    });

    return follows.map(follow => follow.following);
  }

  async getFollowStats(userId: string): Promise<{ followers: number; following: number }> {
    const [followers, following] = await Promise.all([
      this.userFollowRepository.count({ where: { followingId: userId } }),
      this.userFollowRepository.count({ where: { followerId: userId } }),
    ]);

    return { followers, following };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.userFollowRepository.findOne({
      where: { followerId, followingId },
    });

    return !!follow;
  }
}
