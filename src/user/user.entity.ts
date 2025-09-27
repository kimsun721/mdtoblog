import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Repo } from '../repo/repo.entity';
import { Comment } from '../comment/comment.entity';
import { Post } from '../post/post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @OneToMany(() => Repo, (repo) => repo.user)
  repo: Repo;

  @OneToMany(() => Post, (post) => post.user)
  post: Post;

  @OneToMany(() => Comment, (comment) => comment.user)
  comment: Comment[];

  @Column({ nullable: false, unique: true, length: 50 })
  email: string;

  @Column({ name: 'user_name', nullable: false, unique: true, length: 500 })
  userName: string;

  @Column({ name: 'profile_url', nullable: false })
  profileUrl: string;

  @Column({ name: 'github_access_token', nullable: false, type: 'text' })
  githubAccessToken: string;
}
