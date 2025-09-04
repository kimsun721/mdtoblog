import { CreateRepoDto } from 'src/repo/dto/create-repo.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Repo } from 'src/repo/repo.entity';
import { CommonService } from 'src/common/common.service';
import { PostService } from 'src/post/post.service';
import { RepoResponseDto } from './dto/repo-response.dto';

@Injectable()
export class RepoService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Repo)
    private readonly repoRepository: Repository<Repo>,

    private readonly commonService: CommonService,
    private readonly postService: PostService,
  ) {}

  async getRepos(userId: number): Promise<string[]> {
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
    const { repoName, ignorePath, refreshIntervalMinutes } = dto;
    const token = await this.commonService.tokenDecrypt(userId);
    const mdFiles: string[] = [];
    const repos: string[] = await this.getRepos(userId);

    if (!repos.includes(repoName)) {
      throw new BadRequestException(); // repoName틀리게 요청올시
    }

    const browseDir = async (path: string) => {
      const url = `https://api.github.com/repos/${userName}/${repoName}/contents/${path}`;
      const res = await axios.get(url, {
        headers: this.commonService.header(token),
      });

      const data = res.data;

      for (const item of data) {
        if (item.type === 'dir') {
          await browseDir(item.path);
        } else if (item.type === 'file' && item.path.endsWith('.md')) {
          mdFiles.push(item.path);
        }
      }
    };

    await browseDir('');

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('토큰 정보가 올바르지 않습니다');

    // const repoCheck = await this.repoRepository.findOneBy({ user: user });
    // if (!repoCheck) {
    //   throw new BadRequestException('qudtlsdk');
    // }

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

  async createRepoWithPosts(user: any, dto: CreateRepoDto) {
    const { userId, username } = user;
    const repoRes = await this.createRepo(userId, username, dto);
    const postRes = await this.postService.createPost(userId);
  }
}
