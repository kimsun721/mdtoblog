import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GetPostDto } from './dto/get-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get(':id')
  async findAll(@Param() dto: GetPostDto) {
    return await this.postService.getPost(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Req() req) {
    return await this.postService.createPost(req.user.profile.userId);
  }
}
