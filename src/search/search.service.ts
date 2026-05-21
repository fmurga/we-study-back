import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TypesenseService } from '../typesense/typesense.service';

const userPublicSelect = {
  id: true,
  fullName: true,
  username: true,
  image: true,
  roles: true,
  isActive: true,
} as const;

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly typesense: TypesenseService,
  ) {}

  async searchAll(query: string) {
    const q = query.trim();
    if (!q) return { posts: [], lessons: [], users: [] };

    const [postHits, lessonHits, userHits] = await Promise.all([
      this.typesense.search(q, 'posts'),
      this.typesense.search(q, 'lessons'),
      this.typesense.search(q, 'users'),
    ]);

    const postIds = postHits.map((h: any) => h.id);
    const lessonIds = lessonHits.map((h: any) => h.id);
    const userIds = userHits.map((h: any) => h.id);

    const [posts, lessons, users] = await Promise.all([
      postIds.length
        ? this.prisma.post.findMany({
            where: { id: { in: postIds } },
            include: {
              tags: true,
              user: { select: userPublicSelect },
              _count: { select: { comments: true, favourites: true } },
            },
          })
        : [],
      lessonIds.length
        ? this.prisma.lesson.findMany({
            where: { id: { in: lessonIds } },
            include: { tags: true },
          })
        : [],
      userIds.length
        ? this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: userPublicSelect,
          })
        : [],
    ]);

    // Preserve Typesense ranking order
    const postOrder = new Map(postIds.map((id: string, i: number) => [id, i]));
    const lessonOrder = new Map(lessonIds.map((id: string, i: number) => [id, i]));
    const userOrder = new Map(userIds.map((id: string, i: number) => [id, i]));

    return {
      posts: [...posts].sort((a, b) => (postOrder.get(a.id) ?? 0) - (postOrder.get(b.id) ?? 0)),
      lessons: [...lessons].sort((a, b) => (lessonOrder.get(a.id) ?? 0) - (lessonOrder.get(b.id) ?? 0)),
      users: [...users].sort((a, b) => (userOrder.get(a.id) ?? 0) - (userOrder.get(b.id) ?? 0)),
    };
  }

  async reindexAll() {
    const [posts, lessons, users] = await Promise.all([
      this.prisma.post.findMany({ include: { user: { select: { username: true } } } }),
      this.prisma.lesson.findMany(),
      this.prisma.user.findMany(),
    ]);

    await Promise.all([
      this.typesense.bulkIndexPosts(posts),
      this.typesense.bulkIndexLessons(lessons),
      this.typesense.bulkIndexUsers(users),
    ]);

    return { indexed: { posts: posts.length, lessons: lessons.length, users: users.length } };
  }
}
