import { CreateRepoDto } from 'src/repo/dto/create-repo.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Repo } from 'src/repo/repo.entity';
import { CommonService } from 'src/common/common.service';
import { PostService } from 'src/post/post.service';
import { RepoResponseDto } from './dto/repo-response.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Post } from 'src/post/post.entity';

@Injectable()
export class RepoService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Repo)
    private readonly repoRepository: Repository<Repo>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    private readonly commonService: CommonService,
    private readonly postService: PostService,
  ) {}

  async fetchGithubRepos(userId: number): Promise<string[]> {
    const token = await this.commonService.tokenDecrypt(userId);
    const url = `https://api.github.com/user/repos`;

    const repo = await axios.get(url, {
      headers: this.commonService.header(token),
    });

    const repoNames = repo.data.map((r) => r.name);
    return repoNames;
  }

  async createRepo(
    userId: number,
    userName: string,
    dto: CreateRepoDto,
  ): Promise<RepoResponseDto> {
    let { repoName, ignorePath, refreshIntervalMinutes } = dto;
    const token = await this.commonService.tokenDecrypt(userId);
    const mdFiles: string[] = [];
    const repos: string[] = await this.fetchGithubRepos(userId);
    const ignoreLen = ignorePath?.length;

    if (!repos.includes(repoName)) {
      throw new BadRequestException(); // repoName틀리게 요청올시
    }

    const browseDir = async (path: string) => {
      const url = `https://api.github.com/repos/${userName}/${repoName}/contents/${path}`;
      const res = await axios.get(url, {
        headers: this.commonService.header(token),
      });
      const data = res.data;

      const promises = data.map((item) => {
        if (
          ignorePath?.some((path) => item.path.includes(path)) &&
          ignoreLen != 0
        ) {
        } else if (item.type === 'dir') {
          browseDir(item.path);
        } else if (item.type === 'file' && item.path.endsWith('.md')) {
          mdFiles.push(item.path);
        }
      });
    };

    await browseDir('');

    const user = await this.commonService.findUserOrFail(userId);

    const res = await this.repoRepository.save({
      user,
      md_files: mdFiles,
      repo_name: repoName,
      refresh_interval_minutes: refreshIntervalMinutes,
      ignore_path: ignorePath,
    });
    if (!res) {
      throw new BadRequestException();
    }

    return {
      userId,
      userName,
      repoName,
      token,
      mdFiles,
    };
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async autoSyncPosts() {
    const res = await this.repoRepository.find({ relations: ['user'] });
    const now = new Date();
    const result = res.map(async (repo) => {
      const diffMs = now.getTime() - repo.refreshed_at.getTime();
      const diffMinutes = diffMs / (1000 * 60);
      if (diffMinutes > repo.refresh_interval_minutes) {
        await this.postService.syncPosts(repo.user.id);

        await this.repoRepository.update(
          { id: repo.id },
          { refreshed_at: new Date() },
        );

        return repo;
      }
    });
  }
}
