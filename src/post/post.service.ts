import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CommonService } from 'src/common/common.service';
import { Post } from 'src/post/post.entity';
import { Repository } from 'typeorm';
import { GetPostsDto } from './dto/get-posts.dto';
import { GetPostDto } from './dto/get-post.dto';
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

  async getAllPosts(page: number, limit: number) {
    const res = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .select([
        'post.id',
        'post.title',
        'post.updatedAt',
        'post.content',
        'user.id',
        'user.userName',
        'user.profileUrl',
      ])
      .orderBy('post.updatedAt', 'ASC')
      .take(limit)
      .skip((page - 1) * limit)
      .getMany();

    return res;
  }
  async syncPosts(userId: number, pushed_at: Date) {
    const user = await this.commonService.findUserOrFail(userId);
    const repo = await this.repoRepository.findOneOrFail({ where: { user } });
    const token = await this.commonService.tokenDecrypt(userId);
    const userName = user.userName;
    const repoName = repo.repoName;
    const mdFiles = repo.mdFiles;

    const posts = await Promise.all(
      mdFiles.map(async (path) => {
        const url = `https://api.github.com/repos/${userName}/${repoName}/contents/${path}`;
        const res = await axios.get(url, {
          headers: this.commonService.header(token),
        });

        const content = Buffer.from(res.data.content, 'base64').toString('utf-8');
        const sha = res.data.sha;
        const postExist = await this.postRepository.findOneBy({ sha });

        if (!postExist && content) {
          await this.postRepository.save({
            user,
            repo,
            title: res.data.name,
            updated_at: pushed_at,
            content,
            sha,
          });
        }
      }),
    );

    return {
      success: true,
    };
  }

  async getPosts(dto: GetPostsDto): Promise<Post[]> {
    const { userId } = dto;

    const user = await this.commonService.findUserOrFail(userId);

    const res = await this.postRepository.find({});

    return res;
  }

  async getPost(dto: GetPostDto): Promise<Post> {
    const { id } = dto;

    const res = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'comment'],
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
        views: true,
        user: { id: true, userName: true },
        comment: { id: true, user: true, content: true },
      },
    });
    if (!res) {
      throw new NotFoundException();
    }
    const views = res.views + 1;
    await this.postRepository.update({ id }, { views });

    return res;
  }

  async searchPost(keyword: string): Promise<Post[]> {
    const res = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where(
        'MATCH(post.title, post.content) AGAINST(:keyword IN NATURAL LANGUAGE MODE)',
        { keyword },
      )
      .getMany();

    return res;
  }
}
