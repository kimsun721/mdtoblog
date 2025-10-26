import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetPostsDto } from 'src/post/dto/get-posts.dto';
import { PostService } from 'src/post/post.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GetProfileUrlDto } from './dto/get-profile-url.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  @Get('posts/:userId')
  async findUserPosts(@Param('userId') dto: GetPostsDto) {
    return await this.postService.getPosts(dto);
  }

  @Get(':userId')
  async getUserProfile(@Param('userId') id: number) {
    return await this.userService.getUserProfile(id);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('profileUrl')
  // async getProfileUrl(@Req() req) {
  //   console.log(req.user.profile);
  //   return await this.userService.getProfileUrl(req.user.profile);
  // }
}
