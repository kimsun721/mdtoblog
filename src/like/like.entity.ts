import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { LikeEntityType } from './type/like-entity-type';
import { Post } from 'src/post/post.entity';

@Entity('')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: LikeEntityType,
  })
  entityType: LikeEntityType;

  @Column()
  entityId: number;

  @ManyToOne(() => User, (user) => user.likes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post.likes)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}
