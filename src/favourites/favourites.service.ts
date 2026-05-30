import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavouritesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyPostIds(user: User): Promise<string[]> {
    const favs = await this.prisma.favourite.findMany({
      where: { userId: user.id, postId: { not: null } },
      select: { postId: true },
    });
    return favs.map((f) => f.postId!);
  }

  async getMyLessonIds(user: User): Promise<string[]> {
    const favs = await this.prisma.favourite.findMany({
      where: { userId: user.id, lessonId: { not: null } },
      select: { lessonId: true },
    });
    return favs.map((f) => f.lessonId!);
  }

  async getMyFavouritePosts(user: User) {
    const favs = await this.prisma.favourite.findMany({
      where: { userId: user.id, postId: { not: null } },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            user: { select: { id: true, username: true, fullName: true, image: true } },
            tags: true,
            _count: { select: { favourites: true, comments: true } },
          },
        },
      },
    });
    return favs.map((f) => f.post!);
  }

  async getMyFavouriteLessons(user: User) {
    const favs = await this.prisma.favourite.findMany({
      where: { userId: user.id, lessonId: { not: null } },
      orderBy: { createdAt: 'desc' },
      include: {
        lesson: {
          include: { tags: true },
        },
      },
    });
    return favs.map((f) => ({ ...f.lesson!, postsCount: 0 }));
  }

  async togglePost(postId: string, user: User): Promise<{ liked: boolean; count: number }> {
    const existing = await this.prisma.favourite.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });

    if (existing) {
      await this.prisma.favourite.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.favourite.create({
        data: { userId: user.id, postId, type: 'POST' },
      });
    }

    const count = await this.prisma.favourite.count({ where: { postId } });
    return { liked: !existing, count };
  }

  async toggleLesson(lessonId: string, user: User): Promise<{ saved: boolean }> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const existing = await this.prisma.favourite.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId } },
    });

    if (existing) {
      await this.prisma.favourite.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.favourite.create({
        data: { userId: user.id, lessonId, type: 'LESSON' },
      });
    }

    return { saved: !existing };
  }
}
