import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';
import { Comment } from 'src/comment/comment.entity';
import { PostLike } from './entity/post-like.entity';
import { CommentLike } from './entity/comment-like.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,

    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async createPostLike(userId: number, postId: number) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) throw new NotFoundException('존재하지 않는 게시글입니다.');

    await this.postLikeRepository.save({
      user: { id: userId },
      post: { id: postId },
    });

    return;
  }

  async deletePostLike(userId: number, postId: number) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('존재하지 않는 게시글입니다.');

    const res = await this.postLikeRepository.delete({
      user: { id: userId },
      post: { id: postId },
    });
    if (res.affected == 0) {
      throw new NotFoundException();
    }
    return;
  }

  async createCommentLike(userId: number, commentId: number) {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });

    if (!comment) throw new NotFoundException('존재하지 않는 댓글입니다.');

    await this.commentLikeRepository.save({
      user: { id: userId },
      comment: { id: commentId },
    });

    return;
  }

  async deleteCommentLike(userId: number, commentId: number) {
    // const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    // if (!comment) throw new NotFoundException('존재하지 않는 댓글입니다.');

    const res = await this.commentLikeRepository.delete({
      user: { id: userId },
      comment: { id: commentId },
    });
    if (res.affected == 0) {
      throw new NotFoundException();
    }
    return;
  }
}
