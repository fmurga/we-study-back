import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

interface ConnectedClients {
  [id: string]: {
    socket: Socket;
    user: User;
  };
}

const userPublicSelect = {
  id: true,
  fullName: true,
  username: true,
  image: true,
} as const;

@Injectable()
export class MessagesWsService {
  private connectedClients: ConnectedClients = {};

  constructor(private readonly prisma: PrismaService) {}

  async registerClient(client: Socket, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User not active');

    this.checkUserConnection(user);
    this.connectedClients[client.id] = { socket: client, user };
  }

  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }

  getClientData(socketId: string) {
    return this.connectedClients[socketId];
  }

  getUserFullName(socketId: string) {
    return this.connectedClients[socketId].user.fullName;
  }

  async saveMessage(content: string, userId: string, lessonId: string) {
    return this.prisma.message.create({
      data: { content, userId, lessonId },
      include: { user: { select: userPublicSelect } },
    });
  }

  async getByLesson(lessonId: string, limit = 50, cursor?: string) {
    return this.prisma.message.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { user: { select: userPublicSelect } },
    });
  }

  private checkUserConnection(user: User) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId];
      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }
  }
}
