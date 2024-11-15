import { Post } from 'src/posts/entities/post.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  email: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column('text')
  fullName: string;

  @Column({
    type: 'text',
    unique: true,
  })
  username: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'text',
    nullable: true,
    default:
      'https://res.cloudinary.com/dr56kvlbz/image/upload/v1731686000/c0xmffb9ostdp8ahkdiy.jpg',
  })
  image?: string;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
