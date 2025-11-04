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
import { SearchPostDto } from './dto/search-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { LikeService } from 'src/like/like.service';
import { GetPostDto } from './dto/get-post.dto';

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
  async search(@Query('q') query: string) {
    return await this.postService.searchPost(query);
  }

  @Get(':id')
  async getPost(@Param() dto: GetPostDto, @Req() req) {
    return await this.postService.getPost(dto, req?.user?.profile?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/:id/likes')
  async createPostLike(@Req() req, @Param('id') id: number) {
    await this.likeService.createPostLike(req.user.profile.userId, id);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id/likes')
  async deletePostLike(@Param('id') likeId: number, @Req() req) {
    await this.likeService.deletePostLike(req.user.profile.userId, likeId);
    return;
  }

  // @UseGuards(JwtAuthGuard)
  // @Post()
  // async createPost(@Req() req) {
  //   return await this.postService.syncPosts(req.user.profile.userId);
  // }
}
