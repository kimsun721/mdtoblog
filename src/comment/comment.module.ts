import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';
import { CommonService } from 'src/common/common.service';

@Module({
  controllers: [CommentController],
  providers: [CommentService, CommonService],
  imports: [TypeOrmModule.forFeature([Comment, User, Post])],
})
export class CommentModule {}
