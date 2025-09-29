import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';
import { plainToInstance } from 'class-transformer';
import { GetCommentsResponseDto } from './dto/get-comments.dto';
import { UpdateCommentDto, UpdateCommentResponseDto } from './dto/update-comment.dto';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly commonService: CommonService,
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

    if (parentId) {
      const comment = await this.commentRepository.findOneBy({ id: parentId });
      if (!comment) {
        throw new NotFoundException();
      }
    }

    return await this.commentRepository.save({
      post: { id: post.id },
      parentId,
      content,
      user: { id: user.id },
    });
  }

  async updateComment(userId: number, commentId: number, dto: UpdateCommentDto) {
    const { content } = dto;

    let comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
      select: { id: true, content: true, user: { id: true } },
    });
    if (!comment) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    } else if (comment.user.id != userId) {
      throw new ForbiddenException();
    }

    if (comment.content != content) {
      comment.content = content;

      await this.commentRepository.save(comment);
    }

    return plainToInstance(UpdateCommentResponseDto, comment, {
      excludeExtraneousValues: true,
    });
  }

  async deleteComment(userId: number, commentId: number) {}
}
