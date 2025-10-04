import { Post } from 'src/posts/entities/post.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { UserFollow } from 'src/user-follows/entities/user-follow.entity';
import { CalendarEvent } from 'src/calendar/entities/calendar-event.entity';
import { Note } from 'src/notes/entities/note.entity';
import { Report } from 'src/reports/entities/report.entity';
import { Favourite } from 'src/favourites/entities/favourite.entity';
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
    nullable: true,
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

  @Column({ nullable: true })
  googleId?: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => UserFollow, (follow) => follow.follower)
  following: UserFollow[];

  @OneToMany(() => UserFollow, (follow) => follow.following)
  followers: UserFollow[];

  @OneToMany(() => CalendarEvent, (event) => event.user)
  calendarEvents: CalendarEvent[];

  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];

  @OneToMany(() => Report, (report) => report.reportedBy)
  reports: Report[];

  @OneToMany(() => Report, (report) => report.reportedUser)
  reportedContent: Report[];

  @OneToMany(() => Favourite, (favourite) => favourite.user)
  favourites: Favourite[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
