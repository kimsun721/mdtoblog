import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RepoService } from './repo.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateRepoDto } from 'src/repo/dto/create-repo.dto';

@Controller('repo')
export class RepoController {
  constructor(private readonly repoService: RepoService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getRepo(@Req() req): Promise<string[]> {
    return await this.repoService.getRepos(req.user.profile.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createRepo(@Req() req, @Body() dto: CreateRepoDto): Promise<{}> {
    const { userId, userName } = req.user.profile;
    return await this.repoService.createRepo(userId, userName, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('post')
  async createRepoWithPosts(@Req() req, @Body() dto: CreateRepoDto) {
    await this.repoService.createRepoWithPosts(req.user.profile, dto);
  }

  @Get(':search')
  async search(@Param('search') param: string) {
    return await this.repoService.searchPost(param);
  }
}
