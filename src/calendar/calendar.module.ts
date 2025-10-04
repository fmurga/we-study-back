import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEvent } from './entities/calendar-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEvent])],
  exports: [TypeOrmModule],
})
export class CalendarModule { }
