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
import { Comment } from '../../comments/entities/comment.entity';

export enum ReportType {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  MISINFORMATION = 'misinformation',
  COPYRIGHT = 'copyright',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

@Entity('reports')
@Index(['reportedBy', 'post'], { unique: true })
@Index(['reportedBy', 'comment'], { unique: true })
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ReportType })
  reportType: ReportType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Column({ type: 'text', nullable: true })
  adminNotes: string;

  @ManyToOne(() => User, (user) => user.reports)
  reportedBy: User;

  @ManyToOne(() => User, (user) => user.reportedContent, { nullable: true })
  reportedUser: User;

  @ManyToOne(() => Post, (post) => post.reports, { nullable: true })
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.reports, { nullable: true })
  comment: Comment;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  resolvedBy: User;
}
