import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RepoService } from './repo.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateRepoDto } from 'src/repo/dto/create-repo.dto';
import { DeleteRepoDto } from './dto/delete-repo.dto';
import { plainToInstance } from 'class-transformer';
import { PatchRepoDto } from './dto/patch-repo.dto';

@Controller('repo')
export class RepoController {
  constructor(private readonly repoService: RepoService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getRepo(@Req() req): Promise<string[]> {
    return await this.repoService.fetchGithubRepos(req.user.profile.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createRepo(@Req() req, @Body() dto: CreateRepoDto): Promise<{}> {
    const { userId, userName } = req.user.profile;
    return await this.repoService.createRepo(userId, userName, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':repoId')
  async deleteRepo(@Req() req, @Param('repoId') repoId: number): Promise<{}> {
    const dto = plainToInstance(DeleteRepoDto, {
      userId: req.user.profile.userId,
      repoId,
    });

    return await this.repoService.deleteRepo(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':repoId')
  async patchRepo(
    @Req() req,
    @Param('repoId') repoId: number,
    @Body() dto: PatchRepoDto,
  ) {
    return await this.repoService.patchRepo(req.user.profile.id, repoId, dto);
  }
}
