import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { GetPostsDto } from 'src/post/dto/get-posts.dto';
import { PostService } from 'src/post/post.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}
  @Get('posts/:userId')
  async findAll(@Param() dto: GetPostsDto) {
    return await this.postService.getPosts(dto);
  }
}
