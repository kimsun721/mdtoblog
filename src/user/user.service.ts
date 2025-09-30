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

  async getProfileUrl(dto: GetProfileUrlDto) {
    const { id } = dto;
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException();

    return user.profileUrl;
  }

  async getUserProfile(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['post', 'comment'],
      select: {
        id: true,
        userName: true,
        email: true,
        profileUrl: true,
        repo: { repoName: true, mdFiles: true, ignorePath: true },
        post: { title: true, views: true, likes: true, updatedAt: true },
        comment: true,
      },
    });
    if (!user) throw new NotFoundException();

    return user;
  }
}
