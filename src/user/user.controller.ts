import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { PostService } from 'src/post/post.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
  ) {}

  @Get(':userId/posts')
  async findUserPosts(@Param('userId') id: number) {
    return await this.userService.getUserPosts(id);
  }

  @Get(':userId/comments')
  async findUserComments(@Param('userId') id: number) {
    return await this.userService.getUserComments(id);
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
