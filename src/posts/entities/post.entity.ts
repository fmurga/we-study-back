import { Tag } from 'src/tags/entities/tag.entity';
// import { PostImage } from './post-image.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
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

  @ManyToMany(() => Tag, (tags: Tag) => tags.posts)
  @JoinTable()
  tags?: Tag[];
}
