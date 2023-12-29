import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Post } from 'src/posts/entities/post.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    unique: true,
  })
  title: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({
    type: 'text',
    default: 'active',
  })
  status: string;

  @ManyToMany(() => Post, (post: Post) => post.tags)
  posts?: Post[];

  @ManyToMany(() => Lesson, (leson: Lesson) => leson.tags)
  @JoinTable()
  lessons?: Lesson[];

  @BeforeInsert()
  titleToUpperCase() {
    this.title = this.title.toUpperCase();
  }

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
