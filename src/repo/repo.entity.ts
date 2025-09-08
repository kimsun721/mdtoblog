import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Repo {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @OneToOne(() => User, (user) => user.repo)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true, type: 'json' })
  md_files: { sha: string; path: string }[];

  @Column({ nullable: false })
  repo_name: string;

  @Column({ nullable: true, type: 'json' })
  ignore_path: string[];

  @Column({ type: 'int', default: 4320 })
  refresh_interval_minutes: number;

  @CreateDateColumn({ nullable: false, type: 'datetime' })
  refreshed_at: Date;
}
