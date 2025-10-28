import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/post.entity';
import { Comment } from 'src/comment/comment.entity';
import { CommentLike } from './entity/comment-like.entity';
import { PostLike } from './entity/post-like.entity';
import { LikeController } from './like.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment, CommentLike, PostLike])],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService, TypeOrmModule],
})
export class LikeModule {}
