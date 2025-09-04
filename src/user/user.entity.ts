import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Repo } from '../repo/repo.entity';
import { Comment } from '../comment/comment.entity';
import { Post } from '../post/post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @OneToOne(() => Repo, (repo) => repo.user)
  repo: Repo;

  @OneToMany(() => Comment, (comment) => comment.user)
  comment: Comment[];

  @OneToMany(() => Post, (post) => post.user)
  post: Post[];

  @Column({ nullable: false, unique: true, length: 50 })
  email: string;

  @Column({ nullable: false, unique: true, length: 500 })
  username: string;

  @Column({ nullable: false, type: 'text' })
  github_access_token: string;
}
