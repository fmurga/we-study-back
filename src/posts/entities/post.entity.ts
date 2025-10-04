import { Tag } from 'src/tags/entities/tag.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Report } from 'src/reports/entities/report.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
// import { PostImage } from './post-image.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title?: string;

  @Column({ type: 'text', nullable: true })
  slug?: string;

  @Column({ type: 'text' })
  description?: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ type: 'text', nullable: true })
  file?: string;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  user: User;

  @ManyToOne(() => Lesson, (lesson) => lesson.posts, { nullable: true })
  lesson: Lesson;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Report, (report) => report.post)
  reports: Report[];

  @ManyToMany(() => Tag, (tags: Tag) => tags.posts)
  @JoinTable()
  tags?: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
