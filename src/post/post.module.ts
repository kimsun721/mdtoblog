import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { Post } from 'src/post/post.entity';
import { Repo } from 'src/repo/repo.entity';
import { User } from 'src/user/user.entity';
import { LikeModule } from 'src/like/like.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Repo, User]), CommonModule, LikeModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
