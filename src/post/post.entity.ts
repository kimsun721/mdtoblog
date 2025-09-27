import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from '../comment/comment.entity';
import { Repo } from 'src/repo/repo.entity';
import { User } from 'src/user/user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn({ name: 'id', unsigned: true })
  id: number;

  @ManyToOne(() => Repo, (repo) => repo.post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'repo_id' })
  repo: Repo;

  @ManyToOne(() => User, (user) => user.post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comment: Comment[];

  @Column({ nullable: false, type: 'varchar', length: 100 })
  title: string;

  @Column({ nullable: false, type: 'text' })
  content: string;

  @Column({ nullable: false, default: 0 })
  likes: number;

  @Column({ nullable: false, default: 0 })
  views: number;

  @Column({ nullable: false })
  sha: string;

  @CreateDateColumn({ name: 'updated_at', nullable: false, type: 'timestamp' })
  updatedAt: Date;
}
