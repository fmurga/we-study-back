import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto, user: User) {
    return this.prisma.calendarEvent.create({
      data: { ...dto, userId: user.id },
    });
  }

  async findMyEvents(user: User, year: number, month: number) {
    // month is 1-based; get the full month range
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    return this.prisma.calendarEvent.findMany({
      where: {
        userId: user.id,
        startDate: { gte: start, lt: end },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async findOne(id: string, user: User) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException(`Event ${id} not found`);
    if (event.userId !== user.id) throw new ForbiddenException();
    return event;
  }

  async update(id: string, dto: UpdateEventDto, user: User) {
    await this.findOne(id, user);
    return this.prisma.calendarEvent.update({ where: { id }, data: dto });
  }

  async remove(id: string, user: User) {
    await this.findOne(id, user);
    await this.prisma.calendarEvent.delete({ where: { id } });
  }
}
