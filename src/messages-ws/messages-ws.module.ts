import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessagesController } from './messages.controller';
import { MessagesWsGateway } from './messages-ws.gateway';
import { MessagesWsService } from './messages-ws.service';

@Module({
  imports: [AuthModule],
  controllers: [MessagesController],
  providers: [MessagesWsGateway, MessagesWsService],
})
export class MessagesWsModule {}
