import { DeleteRepoDto } from './dto/delete-repo.dto';
import { CreateRepoDto } from 'src/repo/dto/create-repo.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Repo } from 'src/repo/repo.entity';
import { CommonService } from 'src/common/common.service';
import { PostService } from 'src/post/post.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Post } from 'src/post/post.entity';
import { PatchRepoDto } from './dto/patch-repo.dto';
import { CreateWebHookDto } from './dto/set-webhook.dto';

@Injectable()
export class RepoService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Repo)
    private readonly repoRepository: Repository<Repo>,

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
  ): Promise<{ mdFiles: string[]; success: boolean }> {
    const { repoName, ignorePath } = dto;
    const ignoreLen = ignorePath?.length;

    const token = await this.commonService.tokenDecrypt(userId);
    const user = await this.commonService.findUserOrFail(userId);
    const repos: string[] = await this.fetchGithubRepos(userId);

    if (!repos.includes(repoName)) {
      throw new BadRequestException();
    }

    let result;

    const url = `https://api.github.com/repos/${userName}/${repoName}/branches/main`;
    result = await axios.get(url, {
      headers: this.commonService.header(token),
    });

    const sha = result.data.commit.sha;

    const url2 = `https://api.github.com/repos/${userName}/${repoName}/git/trees/${sha}?recursive=1`;

    const allRepo = await axios.get(url2, {
      headers: this.commonService.header(token),
    });

    const data = allRepo.data.tree;
    const f = data.filter((data) => {
      const ignore =
        ignorePath?.some((path) => data.path.includes(path)) && ignoreLen != 0;
      const hidden = data.path.startsWith('.');
      const md = data.path.endsWith('.md');
      return !ignore && !hidden && md;
    });

    const mdFiles = f.map((d) => d.path);

    const res = await this.repoRepository.save({
      user,
      md_files: mdFiles,
      repo_name: repoName,
      commit_sha: sha,
      ignore_path: ignorePath,
    });
    if (!res) {
      throw new BadRequestException();
    }

    const webHookBody: CreateWebHookDto = {
      name: 'web',
      active: true,
      events: ['push'],
      config: {
        url: 'https://8917817da5ce.ngrok-free.app/api/repo/webhook',
        content_type: 'json',
        insecure_ssl: '0',
      },
    };
    const webHookUrl = `https://api.github.com/repos/${userName}/${repoName}/hooks`;
    await axios.post(webHookUrl, webHookBody, {
      headers: this.commonService.header(token),
    });

    return {
      mdFiles,
      success: true,
    };
  }

  async deleteRepo(dto: DeleteRepoDto) {
    const { userId, repoId } = dto;

    const user = await this.commonService.findUserOrFail(userId);
    const repo = await this.repoRepository.findOne({
      where: { id: repoId },
      relations: ['user'],
    });

    if (repo?.user.id !== user.id) {
      throw new ForbiddenException('권한 부족');
    } else if (!repo) {
      throw new NotFoundException('존재하지 않는 레포지토리입니다.');
    }

    const res = await this.repoRepository.delete({ id: repoId });
    if (!res) {
      throw new InternalServerErrorException('삭제중 서버에서 에러 발생');
    }

    return {
      success: true,
    };
  }

  async patchRepo(userId: number, repoId: number, dto: PatchRepoDto) {
    const { ignorePath, branch, refreshIntervalMinutes } = dto;
    const user = await this.commonService.findUserOrFail(userId);
    const repo = await this.repoRepository.findOne({
      where: { id: repoId },
      relations: ['user'],
    });

    if (!repo) {
      throw new NotFoundException('존재하지 않는 레포지토리입니다.');
    } else if (repo?.user.id !== user.id) {
      throw new ForbiddenException('권한 부족');
    }

    const updateData: Partial<Repo> = {};
    if (ignorePath) {
      updateData.ignore_path = ignorePath;
    }

    // if(!branch) {
    //   updateData.branch = branch;
    // }

    const res = await this.repoRepository.update({ id: repoId }, updateData);
    if (!res) throw new InternalServerErrorException('업데이트 중 에러 발생');

    return {
      res,
      success: true,
    };
  }

  async handleRepoUpdate(repoName: string, pushed_at: Date) {
    const repo = await this.repoRepository.findOne({
      where: { repo_name: repoName },
      relations: ['user'],
    });
    if (!repo) {
      throw new NotFoundException('존재하지않는 레포입니다.');
    }

    const token = await this.commonService.tokenDecrypt(repo.user.id);
    const userName = repo.user.username;

    if (repo.updated_at == pushed_at) {
      return;
    }

    // 레포 동기화 로직

    const url = `https://api.github.com/repos/${userName}/${repoName}/branches/main`;
    const result = await axios.get(url, {
      headers: this.commonService.header(token),
    });

    const sha = result.data.commit.sha;
    const ignorePath = repo.ignore_path;
    const ignoreLen = ignorePath.length;

    const url2 = `https://api.github.com/repos/${userName}/${repoName}/git/trees/${sha}?recursive=1`;
    const allRepo = await axios.get(url2, {
      headers: this.commonService.header(token),
    });

    const data = allRepo.data.tree;
    const f = data.filter((data) => {
      const ignore =
        ignorePath?.some((path) => data.path.includes(path)) && ignoreLen != 0;
      const hidden = data.path.startsWith('.');
      const md = data.path.endsWith('.md');
      return !ignore && !hidden && md;
    });

    const mdFiles = f.map((d) => d.path);

    const res = await this.repoRepository.update(
      { id: repo.id },
      {
        md_files: mdFiles,
        updated_at: pushed_at,
      },
    );

    return await this.postService.syncPosts(repo.user.id, pushed_at);
  }
}
