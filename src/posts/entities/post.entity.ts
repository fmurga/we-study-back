import { Tag } from 'src/tags/entities/tag.entity';
import { PostImage } from './post-image.entity';
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
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title?: string;

  @Column({ type: 'text' })
  slug?: string;

  @Column({ type: 'text' })
  description?: string;

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  user: User;

  @ManyToMany(() => Tag, (tags: Tag) => tags.posts)
  @JoinTable()
  tags?: Tag[];

  @OneToMany(() => PostImage, (postImage) => postImage.post, {
    cascade: true,
    eager: true,
  })
  images?: PostImage[];

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
