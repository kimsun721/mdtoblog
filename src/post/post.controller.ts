import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GetPostDto } from './dto/get-post.dto';
import { SearchPostDto } from './dto/search-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async get(@Query() q) {
    return await this.postService.getAllPosts(q.page, q.limit);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return await this.postService.searchPost(query);
  }

  @Get(':id')
  async findAll(@Param() dto: GetPostDto) {
    return await this.postService.getPost(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Req() req) {
    return await this.postService.syncPosts(req.user.profile.userId);
  }
}
