import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';
import { LikeEntityType } from './type/like-entity-type';
import { Comment } from 'src/comment/comment.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async createLike(userId: number, dto: CreateLikeDto) {
    const { entityId, entityType } = dto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }
    let entity;
    if (dto.entityType == LikeEntityType.POST) {
      entity = await this.postRepository.findOne({ where: { id: entityId } });
    } else if (dto.entityType == LikeEntityType.COMMENT) {
      entity = await this.commentRepository.findOne({ where: { id: entityId } });
    }

    const like = await this.likeRepository.findOne({
      where: { entityId, entityType, user: { id: userId } },
    });
    if (like) {
      throw new ConflictException();
    }

    if (!entity && entityType == LikeEntityType.POST) {
      throw new NotFoundException(`존재하지 않는 ${entityType}니다.`);
    }

    await this.likeRepository.save({
      user: { id: userId },
      entityType: entityType,
      entityId,
    });

    return;
  }

  async deleteLike(userId: number, likeId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException();
    }

    const like = await this.likeRepository.findOne({ where: { id: likeId } });
    if (!like) throw new NotFoundException();

    await this.likeRepository.delete({ id: likeId, user: { id: userId } });

    return;
  }
}
