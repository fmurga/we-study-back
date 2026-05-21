import { Controller, Get, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('favourites')
@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Get('my-post-ids')
  @Auth(ValidRoles.user, ValidRoles.admin)
  getMyPostIds(@GetUser() user: User): Promise<string[]> {
    return this.favouritesService.getMyPostIds(user);
  }

  @Post('post/:postId')
  @Auth(ValidRoles.user, ValidRoles.admin)
  togglePost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @GetUser() user: User,
  ) {
    return this.favouritesService.togglePost(postId, user);
  }
}
