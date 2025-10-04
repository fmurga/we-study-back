import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('user_follows')
@Index(['follower', 'following'], { unique: true })
export class UserFollow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.following)
  follower: User;

  @Column({ type: 'uuid' })
  followerId: string;

  @ManyToOne(() => User, (user) => user.followers)
  following: User;

  @Column({ type: 'uuid' })
  followingId: string;

  @CreateDateColumn()
  createdAt: Date;
}
