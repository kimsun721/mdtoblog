import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  
  @Get()
  async findAll() {

  }
  @Get(":id")
  async findOne(@Param('id') id:number) {
    
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost() {
    
  }

}
