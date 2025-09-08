import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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
    return await this.postService.syncPosts(req.user.profile.userId);
  }

  @Get()
  async search(@Query('search') query: string) {
    return await this.postService.searchPost(query);
  }
}
