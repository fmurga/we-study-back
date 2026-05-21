import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query('q') query: string) {
    if (!query?.trim()) return { posts: [], lessons: [], users: [] };
    return this.searchService.searchAll(query);
  }

  @Post('reindex')
  async reindex() {
    return this.searchService.reindexAll();
  }
}
