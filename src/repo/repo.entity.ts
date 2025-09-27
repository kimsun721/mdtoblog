import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Post } from 'src/post/post.entity';

@Entity()
export class Repo {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => User, (user) => user.repo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Post, (post) => post.repo, { onDelete: 'CASCADE' })
  post: Post;

  @Column({ name: 'md_files', nullable: true, type: 'json' })
  mdFiles: string[];

  @Column({ name: 'repo_name', nullable: false })
  repoName: string;

  @Column({ name: 'ignore_path', nullable: true, type: 'json' })
  ignorePath: string[];

  @CreateDateColumn({ name: 'updated_at', nullable: false, type: 'datetime' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at', nullable: false, type: 'datetime' })
  createdAt: Date;
}
