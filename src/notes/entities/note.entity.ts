import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

export enum NoteType {
  LESSON_NOTE = 'lesson_note',
  PERSONAL_NOTE = 'personal_note',
  SUMMARY = 'summary',
  HIGHLIGHT = 'highlight',
}

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: NoteType, default: NoteType.PERSONAL_NOTE })
  noteType: NoteType;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @ManyToOne(() => User, (user) => user.notes)
  user: User;

  @ManyToOne(() => Lesson, (lesson) => lesson.notes, { nullable: true })
  lesson: Lesson;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
