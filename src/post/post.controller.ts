import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { LikeService } from 'src/like/like.service';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { JwtOptionalGuard } from 'src/auth/guards/jwt-optional.guard';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly likeService: LikeService,
  ) {}

  @Get()
  async get(@Query() q) {
    return await this.postService.getAllPosts(q.page, q.limit);
  }

  @Get('search')
  async search(@Query('keyword') keyword: string) {
    return await this.postService.searchPost(keyword);
  }

  @UseGuards(JwtOptionalGuard)
  @Get(':postId')
  async getPost(@Param('postId') postId: number, @UserId() userId: number | null) {
    return await this.postService.getPost(postId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/:postId/likes')
  async createPostLike(@UserId() userId: number, @Param('postId') postId: number) {
    await this.likeService.createPostLike(userId, postId);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:likeId/likes')
  async deletePostLike(@Param('likeId') likeId: number, @UserId() userId: number) {
    await this.likeService.deletePostLike(userId, likeId);
    return;
  }
}
