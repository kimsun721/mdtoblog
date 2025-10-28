import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from '../comment/comment.entity';
import { Repo } from 'src/repo/repo.entity';
import { User } from 'src/user/user.entity';
import { PostLike } from 'src/like/post-like.entity';

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

  @OneToMany(() => PostLike, (post_like) => post_like.post)
  post_likes: PostLike[];

  @Column({ nullable: false, type: 'varchar', length: 100 })
  title: string;

  @Column({ nullable: false, type: 'text' })
  content: string;

  @Column({ nullable: false, default: 0 })
  views: number;

  @Column({ nullable: false })
  sha: string;

  @CreateDateColumn({ name: 'created_at', nullable: false, type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false, type: 'timestamp' })
  updatedAt: Date;
}
