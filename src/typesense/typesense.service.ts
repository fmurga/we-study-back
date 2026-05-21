import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Typesense from 'typesense';

const POSTS_COLLECTION = 'posts';
const LESSONS_COLLECTION = 'lessons';
const USERS_COLLECTION = 'users';

@Injectable()
export class TypesenseService implements OnModuleInit {
  private readonly logger = new Logger('TypesenseService');
  private client: Typesense.Client;

  constructor() {
    this.client = new Typesense.Client({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST || 'localhost',
          port: parseInt(process.env.TYPESENSE_PORT || '8108'),
          protocol: process.env.TYPESENSE_PROTOCOL || 'http',
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY || 'we-study-api-key',
      connectionTimeoutSeconds: 5,
    });
  }

  async onModuleInit() {
    try {
      await this.initCollections();
    } catch (err) {
      this.logger.warn(`Typesense init failed (service may be unavailable): ${err.message}`);
    }
  }

  private async initCollections() {
    await this.ensureCollection({
      name: POSTS_COLLECTION,
      fields: [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string', optional: true },
        { name: 'description', type: 'string', optional: true },
        { name: 'username', type: 'string', optional: true, facet: true },
        { name: 'createdAt', type: 'int64' },
      ],
      default_sorting_field: 'createdAt',
    } as any);

    await this.ensureCollection({
      name: LESSONS_COLLECTION,
      fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'createdAt', type: 'int64' },
      ],
      default_sorting_field: 'createdAt',
    } as any);

    await this.ensureCollection({
      name: USERS_COLLECTION,
      fields: [
        { name: 'id', type: 'string' },
        { name: 'username', type: 'string' },
        { name: 'fullName', type: 'string' },
        { name: 'image', type: 'string', optional: true },
      ],
    } as any);
  }

  private async ensureCollection(schema: any) {
    try {
      await this.client.collections(schema.name).retrieve();
    } catch {
      await this.client.collections().create(schema);
      this.logger.log(`Created Typesense collection: ${schema.name}`);
    }
  }

  async indexPost(post: { id: string; title?: string; description?: string; createdAt: Date; user?: { username: string } }) {
    try {
      await this.client.collections(POSTS_COLLECTION).documents().upsert({
        id: post.id,
        title: post.title ?? '',
        description: post.description ?? '',
        username: post.user?.username ?? '',
        createdAt: Math.floor(post.createdAt.getTime() / 1000),
      });
    } catch (err) {
      this.logger.warn(`Failed to index post ${post.id}: ${err.message}`);
    }
  }

  async deletePost(id: string) {
    try {
      await this.client.collections(POSTS_COLLECTION).documents(id).delete();
    } catch (err) {
      this.logger.warn(`Failed to delete post ${id} from index: ${err.message}`);
    }
  }

  async indexLesson(lesson: { id: string; name: string; description: string; createdAt: Date }) {
    try {
      await this.client.collections(LESSONS_COLLECTION).documents().upsert({
        id: lesson.id,
        name: lesson.name,
        description: lesson.description,
        createdAt: Math.floor(lesson.createdAt.getTime() / 1000),
      });
    } catch (err) {
      this.logger.warn(`Failed to index lesson ${lesson.id}: ${err.message}`);
    }
  }

  async deleteLesson(id: string) {
    try {
      await this.client.collections(LESSONS_COLLECTION).documents(id).delete();
    } catch (err) {
      this.logger.warn(`Failed to delete lesson ${id} from index: ${err.message}`);
    }
  }

  async indexUser(user: { id: string; username: string; fullName: string; image?: string }) {
    try {
      await this.client.collections(USERS_COLLECTION).documents().upsert({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        image: user.image ?? '',
      });
    } catch (err) {
      this.logger.warn(`Failed to index user ${user.id}: ${err.message}`);
    }
  }

  async deleteUser(id: string) {
    try {
      await this.client.collections(USERS_COLLECTION).documents(id).delete();
    } catch (err) {
      this.logger.warn(`Failed to delete user ${id} from index: ${err.message}`);
    }
  }

  async bulkIndexPosts(posts: { id: string; title?: string; description?: string; createdAt: Date; user?: { username: string } }[]) {
    if (!posts.length) return;
    const documents = posts.map((p) => ({
      id: p.id,
      title: p.title ?? '',
      description: p.description ?? '',
      username: p.user?.username ?? '',
      createdAt: Math.floor(p.createdAt.getTime() / 1000),
    }));
    try {
      await this.client.collections(POSTS_COLLECTION).documents().import(documents, { action: 'upsert' });
      this.logger.log(`Bulk indexed ${documents.length} posts`);
    } catch (err) {
      this.logger.warn(`Bulk index posts failed: ${err.message}`);
    }
  }

  async bulkIndexLessons(lessons: { id: string; name: string; description: string; createdAt: Date }[]) {
    if (!lessons.length) return;
    const documents = lessons.map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      createdAt: Math.floor(l.createdAt.getTime() / 1000),
    }));
    try {
      await this.client.collections(LESSONS_COLLECTION).documents().import(documents, { action: 'upsert' });
      this.logger.log(`Bulk indexed ${documents.length} lessons`);
    } catch (err) {
      this.logger.warn(`Bulk index lessons failed: ${err.message}`);
    }
  }

  async bulkIndexUsers(users: { id: string; username: string; fullName: string; image?: string | null }[]) {
    if (!users.length) return;
    const documents = users.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      image: u.image ?? '',
    }));
    try {
      await this.client.collections(USERS_COLLECTION).documents().import(documents, { action: 'upsert' });
      this.logger.log(`Bulk indexed ${documents.length} users`);
    } catch (err) {
      this.logger.warn(`Bulk index users failed: ${err.message}`);
    }
  }

  async search(query: string, type: 'posts' | 'lessons' | 'users') {
    const collectionMap = {
      posts: { collection: POSTS_COLLECTION, queryBy: 'title,description,username' },
      lessons: { collection: LESSONS_COLLECTION, queryBy: 'name,description' },
      users: { collection: USERS_COLLECTION, queryBy: 'username,fullName' },
    };

    const { collection, queryBy } = collectionMap[type];

    const result = await this.client.collections(collection).documents().search({
      q: query,
      query_by: queryBy,
      per_page: 20,
    });

    return result.hits?.map((hit) => hit.document) ?? [];
  }
}
