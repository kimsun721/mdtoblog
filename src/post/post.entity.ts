import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Comment } from "../comment/comment.entity";
import { User } from "../user/user.entity";
import { Repo } from "src/repo/repo.entity";

@Entity()
export class Post {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @OneToMany(() => Comment, (comment) => comment.post)
  comment: Comment[];

  @ManyToOne(() => User, (user) => user.post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: false, type: "varchar", length: 100 })
  title: string;

  @Column({ nullable: false, type: "text" })
  content: string;

  @Column({ nullable: false })
  sha: string;

  @CreateDateColumn({ nullable: false, type: "timestamp" })
  updated_at: Date;
}
