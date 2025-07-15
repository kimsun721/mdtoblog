import { Body, Controller, Get, Req } from '@nestjs/common';
import { RepoService } from './repo.service';

@Controller('repo')
export class RepoController {
  constructor(private readonly repoService: RepoService) {
  }

  @Get()
  async getRepo(@Body() body) {
    return await this.repoService.getRepo(body.token)
  }
}
