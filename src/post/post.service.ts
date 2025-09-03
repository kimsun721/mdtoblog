import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CommonService } from 'src/common/common.service';
import { Post } from 'src/entities/post.entity';
import { User } from 'src/entities/user.entity';
import { RepoService } from 'src/repo/repo.service';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    private readonly commonService: CommonService,
  ) {}

  async createPosts(
    userId: number,
    username: string,
    repoName: string,
    token: string,
    mdFiles: string[],
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('토큰 정보가 올바르지 않습니다');

    for (const path of mdFiles) {
      const url = `https://api.github.com/repos/${username}/${repoName}/contents/${path}`;
      const res = await axios.get(url, {
        headers: this.commonService.header(token),
      });
      let content = Buffer.from(res.data.content, 'base64').toString('utf-8');
      let firstLine = content.split('\n')[0];

      if (firstLine == '') {
        firstLine = '무제';
      }
      await this.postRepository.save({
        user,
        title: firstLine,
        content,
      });
    }
  }
}
