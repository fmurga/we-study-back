import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('type') type: 'posts' | 'lessons' | 'users',
  ) {
    if (!query) return { results: [] };

    if (type) {
      const results = await this.searchService.search(query, type);
      return { results };
    }

    return this.searchService.searchAll(query);
  }
}
