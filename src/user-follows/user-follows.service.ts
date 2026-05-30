import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserFollowDto } from './dto/create-user-follow.dto';
import { ErrorHandlerFactory, ErrorCode } from '../common/errors/error-handler.factory';

@Injectable()
export class UserFollowsService {
  constructor(private readonly prisma: PrismaService) {}

  async followUser(createUserFollowDto: CreateUserFollowDto, follower: User) {
    const { followingId } = createUserFollowDto;

    if (follower.id === followingId) {
      ErrorHandlerFactory.createError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'You cannot follow yourself',
      });
    }

    const userToFollow = await this.prisma.user.findUnique({ where: { id: followingId } });
    if (!userToFollow) {
      ErrorHandlerFactory.createError({ code: ErrorCode.NOT_FOUND, message: 'User not found' });
    }

    const existingFollow = await this.prisma.userFollow.findFirst({
      where: { followerId: follower.id, followingId },
    });
    if (existingFollow) {
      ErrorHandlerFactory.createError({ code: ErrorCode.CONFLICT, message: 'Already following this user' });
    }

    return this.prisma.userFollow.create({
      data: { followerId: follower.id, followingId },
    });
  }

  async unfollowUser(followingId: string, follower: User) {
    const userFollow = await this.prisma.userFollow.findFirst({
      where: { followerId: follower.id, followingId },
    });

    if (!userFollow) {
      ErrorHandlerFactory.createError({ code: ErrorCode.NOT_FOUND, message: 'You are not following this user' });
    }

    await this.prisma.userFollow.delete({ where: { id: userFollow.id } });
  }

  private readonly userPublicSelect = {
    id: true,
    username: true,
    fullName: true,
    image: true,
    bio: true,
    isActive: true,
    roles: true,
    email: true,
  } as const;

  async getFollowers(userId: string) {
    const follows = await this.prisma.userFollow.findMany({
      where: { followingId: userId },
      include: { follower: { select: this.userPublicSelect } },
    });
    return follows.map((f) => f.follower);
  }

  async getFollowing(userId: string) {
    const follows = await this.prisma.userFollow.findMany({
      where: { followerId: userId },
      include: { following: { select: this.userPublicSelect } },
    });
    return follows.map((f) => f.following);
  }

  async getFollowStats(userId: string) {
    const [followers, following] = await Promise.all([
      this.prisma.userFollow.count({ where: { followingId: userId } }),
      this.prisma.userFollow.count({ where: { followerId: userId } }),
    ]);
    return { followers, following };
  }

  async isFollowing(followerId: string, followingId: string) {
    const follow = await this.prisma.userFollow.findFirst({
      where: { followerId, followingId },
    });
    return !!follow;
  }
}
