import { Tag } from 'src/tags/entities/tag.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Note } from 'src/notes/entities/note.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ type: 'text', nullable: true })
  videoUrl?: string;

  @Column({ type: 'json', nullable: true })
  materials?: string[];

  @OneToMany(() => Post, (post) => post.lesson)
  posts: Post[];

  @OneToMany(() => Note, (note) => note.lesson)
  notes: Note[];

  @ManyToMany(() => Tag, (tags: Tag) => tags.lessons)
  @JoinTable()
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
