import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";
import { Post } from "src/post/post.entity";

@Entity()
export class Repo {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => User, (user) => user.repo)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Post, (post) => post.repo)
  post: Post;

  @Column({ nullable: true, type: "json" })
  md_files: string[];

  @Column({ nullable: false })
  repo_name: string;

  @Column({ nullable: true, type: "json" })
  ignore_path: string[];

  @Column({ type: "int", default: 4320 })
  refresh_interval_minutes: number;

  @Column({ nullable: false })
  commit_sha: string;

  @CreateDateColumn({ nullable: false, type: "datetime" })
  refreshed_at: Date;

  @CreateDateColumn({ nullable: false, type: "datetime" })
  created_at: Date;
}
