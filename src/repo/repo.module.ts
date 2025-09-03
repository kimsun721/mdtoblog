import { Module, Post } from '@nestjs/common';
import { RepoService } from './repo.service';
import { RepoController } from './repo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repo } from 'src/repo/repo.entity';
import { CommonModule } from 'src/common/common.module';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Repo]), CommonModule, PostModule],
  controllers: [RepoController],
  providers: [RepoService],
})
export class RepoModule {}
