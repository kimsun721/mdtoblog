import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';
import { plainToInstance } from 'class-transformer';
import { GetCommentsResponseDto } from './dto/get-comments.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async getComments(id: number): Promise<GetCommentsResponseDto[]> {
    const comments = await this.commentRepository.find({
      where: { post: { id } },
      relations: ['user'],
    });

    const res = plainToInstance(GetCommentsResponseDto, comments, {
      excludeExtraneousValues: true,
    });

    return res;
  }

  async createComment(dto: CreateCommentDto, userId: number) {
    const { postId, parentId, content } = dto;

    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException();
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('토큰 문제 발생');
    }

    const comment = await this.commentRepository.findOneBy({ id: parentId });
    if (!comment) {
      throw new NotFoundException();
    }

    return await this.commentRepository.save({
      post: { id: postId },
      parentId,
      content,
      user: { id: userId },
    });
  }
}
