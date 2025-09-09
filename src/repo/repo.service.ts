import { DeleteRepoDto } from "./dto/delete-repo.dto";
import { CreateRepoDto } from "src/repo/dto/create-repo.dto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import { User } from "src/user/user.entity";
import { Repository } from "typeorm";
import { Repo } from "src/repo/repo.entity";
import { CommonService } from "src/common/common.service";
import { PostService } from "src/post/post.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Post } from "src/post/post.entity";

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

  async createRepo(userId: number, userName: string, dto: CreateRepoDto): Promise<{ mdFiles: string[]; success: boolean }> {
    const { repoName, ignorePath, refreshIntervalMinutes } = dto;
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
      const ignore = ignorePath?.some((path) => data.path.includes(path)) && ignoreLen != 0;
      const hidden = data.path.startsWith(".");
      const md = data.path.endsWith(".md");
      return !ignore && !hidden && md;
    });

    const mdFiles = f.map((d) => d.path);

    const res = await this.repoRepository.save({
      user,
      md_files: mdFiles,
      repo_name: repoName,
      commit_sha: sha,
      refresh_interval_minutes: refreshIntervalMinutes,
      ignore_path: ignorePath,
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
    const repoExist = await this.repoRepository.findOneBy({ id: repoId });
    if (!repoExist) {
      throw new NotFoundException("존재하지 않는 레포지토리입니다.");
    }

    const ress = await this.postRepository.delete({});
    const res = await this.repoRepository.delete;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async autoSyncPosts() {
    const res = await this.repoRepository.find({ relations: ["user"] });
    const now = new Date();
    const result = res.map(async (repo) => {
      const diffMs = now.getTime() - repo.refreshed_at.getTime();
      const diffMinutes = diffMs / (1000 * 60);
      if (diffMinutes > repo.refresh_interval_minutes) {
        await this.postService.syncPosts(repo.user.id);

        await this.repoRepository.update({ id: repo.id }, { refreshed_at: new Date() });

        return repo;
      }
    });
  }
}
