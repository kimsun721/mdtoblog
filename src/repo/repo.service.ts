import { DeleteRepoDto } from './dto/delete-repo.dto';
import { CreateRepoDto } from 'src/repo/dto/create-repo.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Repo } from 'src/repo/repo.entity';
import { CommonService } from 'src/common/common.service';
import { PostService } from 'src/post/post.service';
import { Post } from 'src/post/post.entity';
import { PatchRepoDto } from './dto/patch-repo.dto';
import { CreateWebHookDto } from './dto/set-webhook.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RepoService {
  constructor(
    @InjectRepository(Repo)
    private readonly repoRepository: Repository<Repo>,

    private readonly commonService: CommonService,
    private readonly postService: PostService,
    private readonly configService: ConfigService,
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
    dto: CreateRepoDto,
  ): Promise<{ mdFiles: string[]; success: boolean }> {
    const { repoName, ignorePath } = dto;

    const token = await this.commonService.tokenDecrypt(userId);
    const user = await this.commonService.findUserOrFail(userId);
    const repos: string[] = await this.fetchGithubRepos(userId);
    const userName = user.userName;

    if (!repos.includes(repoName)) {
      throw new BadRequestException();
    }

    const sameRepo = await this.repoRepository.findOne({
      where: { repoName, user: { id: userId } },
      relations: ['user'],
    });
    if (sameRepo) {
      throw new ConflictException('중복되는 레포지토리입니다.');
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

    const ignorePathArr = ignorePath ?? [];
    const tree = allRepo.data.tree;
    const mdFiles: string[] = tree
      .filter(
        (d) =>
          !ignorePathArr.some((path) => d.path.includes(path)) &&
          !d.path.startsWith('.') &&
          d.path.endsWith('.md'),
      )
      .map((d) => d.path);

    if (mdFiles.length == 0) {
      throw new NotFoundException('조건에 맞는 md파일이 레포에 존재하지 않습니다.');
    }

    const webHookBody: CreateWebHookDto = {
      name: 'web',
      active: true,
      events: ['push'],
      config: {
        url: `${this.configService.get('BACKEND_URL')}/api/repo/webhook`,
        content_type: 'json',
        insecure_ssl: '0',
      },
    };
    const webHookUrl = `https://api.github.com/repos/${userName}/${repoName}/hooks`;
    try {
      await axios.post(webHookUrl, webHookBody, {
        headers: this.commonService.header(token),
      });
    } catch (e) {
      if (e.status != 422) {
        // 422면 이미 레포등록했다가 지웠던지 해서 이미 등록되있는거임
        throw new InternalServerErrorException();
      }
    }

    const res = await this.repoRepository.save({
      user,
      mdFiles,
      repoName,
      ignorePath,
    });
    if (!res) {
      throw new BadRequestException();
    }

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

    if (!repo) {
      throw new NotFoundException('존재하지 않는 레포지토리입니다.');
    } else if (repo?.user.id !== user.id) {
      throw new ForbiddenException('권한 부족');
    }

    const res = await this.repoRepository.delete({ id: repoId });
    if (res.affected == 0) {
      throw new InternalServerErrorException('삭제중 서버에서 에러 발생');
    }

    const url = `https://api.github.com/repos/${repo?.user.userName}/${repo?.repoName}/hooks`;
    const token = await this.commonService.tokenDecrypt(userId);
    let hookId = 0;
    try {
      const hooks = await axios.get(url, {
        headers: this.commonService.header(token),
      });
      hookId = hooks.data.find(
        (v) => v.config.url === 'https://8917817da5ce.ngrok-free.app/api/repo/webhook',
      )?.id;
    } catch (e) {
      console.log(e);
    }

    if (hookId) {
      const url = `https://api.github.com/repos/${repo?.user.userName}/${repo?.repoName}/hooks/${hookId}`;
      await axios.delete(url, {
        headers: this.commonService.header(token),
      });
    }

    return {
      success: true,
    };
  }

  async patchRepo(userId: number, repoId: number, dto: PatchRepoDto) {
    const { ignorePath, branch } = dto;
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
      updateData.ignorePath = ignorePath;
    }

    // TODO:나중에 브랜치 main 고정으로 두든 뭐 어떻게든 고치기

    // if(!branch) {
    //   updateData.branch = branch;
    // }

    const result = await this.postService.syncPosts(userId, new Date());

    const res = await this.repoRepository.update({ id: repoId }, updateData);
    if (!res) throw new InternalServerErrorException('업데이트 중 에러 발생');

    return {
      res,
      success: true,
    };
  }

  // TODO : ignorePath 수정해도 post에 반영이 안되는 문제 해결
  async handleRepoUpdate(repoName: string, pushed_at: Date, userId?: number) {
    const repo = await this.repoRepository.findOne({
      where: { repoName },
      relations: ['user'],
    });
    if (!repo) {
      throw new NotFoundException('존재하지않는 레포입니다.');
    }
    if (userId && userId != repo.user.id) {
      throw new ForbiddenException();
    }

    const token = await this.commonService.tokenDecrypt(repo.user.id);
    const userName = repo.user.userName;

    if (repo.updatedAt == pushed_at) {
      return;
    }

    // 레포 동기화 로직

    const url = `https://api.github.com/repos/${userName}/${repoName}/branches/main`;
    const result = await axios.get(url, {
      headers: this.commonService.header(token),
    });

    const sha = result.data.commit.sha;
    const ignorePath = repo.ignorePath;

    const url2 = `https://api.github.com/repos/${userName}/${repoName}/git/trees/${sha}?recursive=1`;
    const allRepo = await axios.get(url2, {
      headers: this.commonService.header(token),
    });

    const ignorePathArr = ignorePath ?? [];
    const tree = allRepo.data.tree;
    const mdFiles: string[] = tree
      .filter(
        (d) =>
          !ignorePathArr.some((path) => d.path.includes(path)) &&
          !d.path.startsWith('.') &&
          d.path.endsWith('.md'),
      )
      .map((d) => d.path);

    await this.repoRepository.update(
      { id: repo.id },
      {
        mdFiles,
        updatedAt: pushed_at,
      },
    );

    return await this.postService.syncPosts(repo.user.id, pushed_at);
  }

  async getUserRepo(userId: number) {
    const repos = await this.repoRepository.find({ where: { user: { id: userId } } });

    return repos;
  }
}
