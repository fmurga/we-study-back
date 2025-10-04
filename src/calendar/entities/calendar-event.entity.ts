import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum EventType {
  LESSON = 'lesson',
  EXAM = 'exam',
  ASSIGNMENT = 'assignment',
  STUDY_SESSION = 'study_session',
  MEETING = 'meeting',
  OTHER = 'other',
}

@Entity('calendar_events')
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: EventType, default: EventType.OTHER })
  eventType: EventType;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'boolean', default: false })
  isAllDay: boolean;

  @Column({ type: 'boolean', default: false })
  hasReminder: boolean;

  @Column({ type: 'int', nullable: true })
  reminderMinutes: number;

  @ManyToOne(() => User, (user) => user.calendarEvents)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
