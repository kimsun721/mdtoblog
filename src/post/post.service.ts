import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CommonService } from 'src/common/common.service';
import { Post } from 'src/post/post.entity';
import { Repository } from 'typeorm';
import { GetPostsDto } from './dto/get-posts.dto';
import { GetPostDto } from './dto/get-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { Repo } from 'src/repo/repo.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Repo)
    private readonly repoRepository: Repository<Repo>,

    private readonly commonService: CommonService,
  ) {}

  async createPost(userId: number) {
    const user = await this.commonService.findUserOrFail(userId);
    const repo = await this.repoRepository.findOneOrFail({ where: { user } });
    const token = await this.commonService.tokenDecrypt(userId);
    const userName = user.username;
    const repoName = repo.repo_name;
    if (!repoName) {
      throw new NotFoundException('No repo has been specified yet');
    }
    const mdFiles = repo.md_files;

    const posts = await Promise.all(
      mdFiles.map(async (path) => {
        const url = `https://api.github.com/repos/${userName}/${repoName}/contents/${path}`;
        const res = await axios.get(url, {
          headers: this.commonService.header(token),
        });

        const content = Buffer.from(res.data.content, 'base64').toString(
          'utf-8',
        );

        await this.postRepository.save({
          user,
          title: res.data.name,
          content,
        });
      }),
    );

    return {
      success: true,
    };
  }

  async getPosts(dto: GetPostsDto): Promise<Post[]> {
    const { userId } = dto;

    const user = await this.commonService.findUserOrFail(userId);

    const res = await this.postRepository.find({
      where: { user: { id: userId } },
    });
    if (!res) {
      throw new NotFoundException();
    }

    return res;
  }

  async getPost(dto: GetPostDto): Promise<Post> {
    const { id } = dto;

    const res = await this.postRepository.findOneBy({ id });
    if (!res) {
      throw new NotFoundException();
    }

    return res;
  }
}
