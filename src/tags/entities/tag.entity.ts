import { ApiProperty } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tags')
export class Tag {
  @ApiProperty({ example: randomUUID() })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'AM1' })
  @Column({
    type: 'text',
    nullable: false,
    unique: true,
  })
  name: string;

  @ApiProperty({ example: 'am1' })
  @Column({ type: 'text', unique: true })
  slug: string;

  @ApiProperty({ example: 'active' })
  @Column({
    type: 'text',
    default: 'active',
  })
  status: string;
  @ManyToMany(() => Post, (post: Post) => post.tags)
  @JoinTable()
  posts: Post[];
  @ManyToMany(() => Lesson, (leson: Lesson) => leson.tags)
  @JoinTable()
  lessons: Lesson[];
}
