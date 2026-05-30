import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { MessagesWsService } from './messages-ws.service';

@ApiTags('messages')
@Controller('messages')
@Auth(ValidRoles.user, ValidRoles.admin)
export class MessagesController {
  constructor(private readonly messagesWsService: MessagesWsService) {}

  @Get(':lessonId')
  getByLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.messagesWsService.getByLesson(lessonId, limit, cursor);
  }
}
