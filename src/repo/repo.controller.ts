import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { RepoService } from './repo.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateRepoDto } from 'src/dto/RequestDto/CreateRepoDto';

@Controller('repo')
export class RepoController {
  constructor(private readonly repoService: RepoService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getRepo(@Req() req) {
    return await this.repoService.getRepos(req.user.profile.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createRepo(@Req() req, @Body() body: CreateRepoDto) {
    const { userId, username } = req.user.profile;
    return await this.repoService.createRepo(userId, username, body);
  }
}
