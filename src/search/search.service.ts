import { Injectable } from '@nestjs/common';
import { TypesenseService } from '../typesense/typesense.service';

@Injectable()
export class SearchService {
  constructor(private readonly typesense: TypesenseService) {}

  async search(query: string, type: 'posts' | 'lessons' | 'users') {
    return this.typesense.search(query, type);
  }

  async searchAll(query: string) {
    const [posts, lessons, users] = await Promise.all([
      this.typesense.search(query, 'posts'),
      this.typesense.search(query, 'lessons'),
      this.typesense.search(query, 'users'),
    ]);
    return { posts, lessons, users };
  }
}
