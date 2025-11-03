import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PostModule } from 'src/post/post.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Post } from 'src/post/post.entity';
import { Comment } from 'src/comment/comment.entity';
import { RepoModule } from 'src/repo/repo.module';
import { Repo } from 'src/repo/repo.entity';

@Module({
  imports: [RepoModule, TypeOrmModule.forFeature([User, Post, Comment])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
