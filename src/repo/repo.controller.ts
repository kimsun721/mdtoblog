import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { SyncRepoDto } from './dto/sync-repo.dto';
import { UserId } from 'src/common/decorators/user-id.decorator';

@Controller('repo')
export class RepoController {
  constructor(private readonly repoService: RepoService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getRepo(@UserId() userId: number): Promise<string[]> {
    return await this.repoService.fetchGithubRepos(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createRepo(@UserId() userId: number, @Body() dto: CreateRepoDto): Promise<{}> {
    return await this.repoService.createRepo(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':repoId')
  async deleteRepo(@UserId() userId: number, @Param('repoId') repoId: number) {
    const dto = plainToInstance(DeleteRepoDto, {
      userId,
      repoId,
    });

    await this.repoService.deleteRepo(dto);

    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':repoId')
  async patchRepo(
    @UserId() userId: number,
    @Param('repoId') repoId: number,
    @Body() dto: PatchRepoDto,
  ) {
    return await this.repoService.patchRepo(userId, repoId, dto);
  }

  // 깃허브 웹훅 연동 api
  @Post('webhook')
  async handleWebhook(@Req() req) {
    return await this.repoService.handleRepoUpdate(
      req.body.repository.name,
      req.body.repository.pushed_at,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync')
  async syncRepo(@UserId() userId: number, @Body() dto: SyncRepoDto) {
    await this.repoService.handleRepoUpdate(dto.repoName, new Date(), userId);
  }
}
