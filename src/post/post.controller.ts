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

  @Get(':postId')
  async getPost(@Param('postId') postId: number, @Req() req) {
    console.log(req.user);
    return await this.postService.getPost(postId, req?.user?.profile?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/:postId/likes')
  async createPostLike(@Req() req, @Param('postId') postId: number) {
    await this.likeService.createPostLike(req.user.profile.userId, postId);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:likeId/likes')
  async deletePostLike(@Param('likeId') likeId: number, @Req() req) {
    await this.likeService.deletePostLike(req.user.profile.userId, likeId);
    return;
  }
}
