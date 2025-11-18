import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { PostService } from 'src/post/post.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RepoService } from 'src/repo/repo.service';
import { UserId } from 'src/common/decorators/user-id.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly repoService: RepoService,
  ) {}

  @Get(':userId/posts')
  async findUserPosts(@Param('userId') id: number) {
    return await this.userService.getUserPosts(id);
  }

  @Get(':userId/comments')
  async findUserComments(@Param('userId') id: number) {
    return await this.userService.getUserComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('repos')
  async getUserRepos(@UserId() userId: number) {
    return await this.repoService.getUserRepo(userId);
  }

  @Get(':userId')
  async getUserProfile(@Param('userId', ParseIntPipe) id: number) {
    return await this.userService.getUserProfile(id);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('profileUrl')
  // async getProfileUrl(@Req() req) {
  //   console.log(req.user.profile);
  //   return await this.userService.getProfileUrl(req.user.profile);
  // }
}
