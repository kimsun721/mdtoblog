import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';
import { Comment } from 'src/comment/comment.entity';
import { CommentLike } from './comment-like.entity';
import { PostLike } from './post-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentLike, PostLike, User, Post, Comment])],
  controllers: [],
  providers: [LikeService],
})
export class LikeModule {}
