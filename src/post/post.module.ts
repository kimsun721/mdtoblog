import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { CommonService } from 'src/common/common.service';
import { CommonModule } from 'src/common/common.module';
import { Post } from 'src/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post]), CommonModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
