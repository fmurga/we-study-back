import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ type: 'boolean', default: false })
  isReported: boolean;

  @Column({ type: 'int', default: 0 })
  reportCount: number;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  parentComment: Comment;

  @Column({ type: 'uuid', nullable: true })
  parentCommentId: string;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];

  // Import will be added after Report entity is fixed
  reports: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
