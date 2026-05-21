import { Injectable } from '@nestjs/common';
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
}
