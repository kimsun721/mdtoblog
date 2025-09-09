import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Comment } from "../comment/comment.entity";
import { Repo } from "src/repo/repo.entity";

@Entity()
export class Post {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => Repo, (repo) => repo.post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "repo_id" })
  repo: Repo;

  @OneToMany(() => Comment, (comment) => comment.post)
  comment: Comment[];

  @Column({ nullable: false, type: "varchar", length: 100 })
  title: string;

  @Column({ nullable: false, type: "text" })
  content: string;

  @Column({ nullable: false })
  sha: string;

  @CreateDateColumn({ nullable: false, type: "timestamp" })
  updated_at: Date;
}
