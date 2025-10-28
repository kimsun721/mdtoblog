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
import { PostLike } from './post-like.entity';
import { CommentLike } from './comment-like.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,

    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async createPostLike(userId: number, postId: number) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const like = await this.postLikeRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (!post) throw new NotFoundException('존재하지 않는 게시글입니다.');
    if (!user) throw new NotFoundException('존재하지 않는 유저입니다.');
    if (!like) throw new ConflictException('이미 좋아요가 눌려져있습니다.');

    await this.postLikeRepository.save({
      user: { id: userId },
      post: { id: postId },
    });

    return;
  }

  async deletePostLike(userId: number, postId: number) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const like = await this.postLikeRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (!post) throw new NotFoundException('존재하지 않는 게시글입니다.');
    if (!user) throw new NotFoundException('존재하지 않는 유저입니다.');
    if (!like) throw new NotFoundException('좋아요가 눌려있지 않은 게시글입니다.');

    await this.postLikeRepository.delete({ id: like.id });
    return;
  }
}
