import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/interfaces';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL ?? 'http://localhost:3000',
    ],
    credentials: true,
  },
})
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    // Support both cookie-based auth (browser) and header-based auth (testing/mobile)
    const token =
      this.extractTokenFromCookie(client.handshake.headers.cookie) ??
      (client.handshake.headers.authentication as string | undefined);

    if (!token) {
      client.disconnect();
      return;
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch {
      client.disconnect();
      return;
    }

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  /** Client joins a lesson chat room. Must be called before sending messages. */
  @SubscribeMessage('join-lesson')
  onJoinLesson(client: Socket, lessonId: string) {
    client.join(lessonId);
  }

  @SubscribeMessage('message-from-client')
  async onMessageFromClient(client: Socket, payload: NewMessageDto) {
    const clientData = this.messagesWsService.getClientData(client.id);
    if (!clientData) return;

    const message = await this.messagesWsService.saveMessage(
      payload.message,
      clientData.user.id,
      payload.lessonId,
    );

    this.wss.to(payload.lessonId).emit('message-from-server', {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      lessonId: message.lessonId,
      user: {
        id: clientData.user.id,
        fullName: clientData.user.fullName,
        username: clientData.user.username,
        image: clientData.user.image,
      },
    });
  }

  private extractTokenFromCookie(cookieHeader?: string): string | undefined {
    if (!cookieHeader) return undefined;
    const match = cookieHeader.match(/we_study_session=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  }
}
