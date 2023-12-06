import { Tag } from 'src/tags/entities/tag.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'text', nullable: false })
  name: string;
  @Column({ type: 'text', nullable: false })
  description: string;

  @ManyToMany(() => Tag, (tags: Tag) => tags.lessons)
  @JoinTable()
  tags: Tag[];
}
