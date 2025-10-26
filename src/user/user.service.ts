import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GetProfileUrlDto } from './dto/get-profile-url.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserProfile(id: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.repo', 'repo')
      .leftJoinAndSelect('user.post', 'post')
      .leftJoinAndSelect('user.comment', 'comment')
      .select([
        'user.id',
        'user.userName',
        'user.email',
        'user.githubId',
        'repo.repoName',
        'repo.mdFiles',
        'repo.ignorePath',
        'post.id',
        'post.title',
        'post.views',
        'post.likes',
        'post.updatedAt',
        'comment', // 그냥 다 가져옴
      ])
      .where('user.id = :id', { id })
      .getOne();
    if (!user) throw new NotFoundException();

    return user;
  }
}
