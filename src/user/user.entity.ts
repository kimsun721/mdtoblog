import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Repo } from '../repo/repo.entity';
import { Comment } from '../comment/comment.entity';
import { Post } from '../post/post.entity';
import { PostLike } from 'src/like/entity/post-like.entity';
import { CommentLike } from 'src/like/entity/comment-like.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @OneToMany(() => Repo, (repo) => repo.user)
  repo: Repo[];

  @OneToMany(() => Post, (post) => post.user)
  post: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comment: Comment[];

  @OneToMany(() => PostLike, (post_like) => post_like.user)
  post_likes: PostLike[];

  @OneToMany(() => CommentLike, (comment_like) => comment_like.user)
  comment_likes: CommentLike[];

  @Column({ nullable: false, unique: true, length: 50 })
  email: string;

  @Column({ name: 'user_name', nullable: false, unique: true, length: 500 })
  userName: string;

  @Column({ name: 'refresh_token', nullable: true, type: 'varchar' })
  refreshToken: string | null;

  @Column({ name: 'github_id', nullable: false })
  githubId: number;

  @Column({ name: 'github_access_token', nullable: false, type: 'text' })
  githubAccessToken: string;
}
