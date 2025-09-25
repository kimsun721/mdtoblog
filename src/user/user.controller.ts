import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetPostsDto } from 'src/post/dto/get-posts.dto';
import { PostService } from 'src/post/post.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

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

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfileUrl(@Req() req) {
    return await this.userService.getProfileUrl(req.user.profile.userId);
  }
}
