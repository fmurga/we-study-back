import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum FavouriteType {
  POST = 'post',
  LESSON = 'lesson',
  COMMENT = 'comment',
}

@Entity('favourites')
@Index(['user', 'post'], { unique: true })
@Index(['user', 'lesson'], { unique: true })
@Index(['user', 'comment'], { unique: true })
export class Favourite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: FavouriteType })
  type: FavouriteType;

  @ManyToOne(() => User, (user) => user.favourites)
  user: User;

  @ManyToOne(() => Post, { nullable: true })
  post: Post;

  @ManyToOne(() => Lesson, { nullable: true })
  lesson: Lesson;

  @ManyToOne(() => Comment, { nullable: true })
  comment: Comment;

  @CreateDateColumn()
  createdAt: Date;
}
