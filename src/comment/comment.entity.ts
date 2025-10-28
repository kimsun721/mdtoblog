import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Post } from '../post/post.entity';
import { CommentLike } from 'src/like/comment-like.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => User, (user) => user.comment)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @OneToMany(() => CommentLike, (comment_like) => comment_like.comment)
  comment_likes: CommentLike[];

  @Column({ name: 'parent_id', nullable: true, type: 'int' })
  parentId: number;

  @Column({ nullable: false, type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at', nullable: false, type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false, type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
