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
  async findAll(@Param() dto: GetPostsDto) {
    return await this.postService.getPost(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/likes')
  @HttpCode(HttpStatus.CREATED)
  async createPostLike(@Req() req, @Param('id') id: number) {
    await this.likeService.createPostLike(req.user.profile.userId, id);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id/likes')
  @HttpCode(HttpStatus.NO_CONTENT)
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
