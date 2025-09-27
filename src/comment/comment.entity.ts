import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Post } from '../post/post.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => User, (user) => user.comment)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_id' })
  post: Post;

  @Column({ name: 'parent_id', nullable: true, type: 'int' })
  parentId: number;

  @Column({ nullable: false, type: 'text' })
  content: string;

  @Column({ name: 'created_at', nullable: false, type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'updatedAt', nullable: false, type: 'datetime' })
  updatedAt: Date;
}
