import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';
import { Comment } from 'src/comment/comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalPosts, totalUsers, totalComments, todayPosts, todayAuthors, totalViews] =
      await Promise.all([
        this.postRepository.count(),
        this.userRepository.count(),
        this.commentRepository.count(),
        this.postRepository
          .createQueryBuilder('post')
          .where('post.createdAt >= :today', { today })
          .getCount(),
        this.postRepository
          .createQueryBuilder('post')
          .select('COUNT(DISTINCT post.userId)', 'count')
          .where('post.createdAt >= :today', { today })
          .getRawOne<{ count: string }>()
          .then((r) => Number(r?.count ?? 0)),
        this.postRepository
          .createQueryBuilder('post')
          .select('SUM(post.views)', 'total')
          .getRawOne<{ total: string }>()
          .then((r) => Number(r?.total ?? 0)),
      ]);

    return {
      totalPosts,
      totalUsers,
      totalComments,
      totalViews,
      today: {
        posts: todayPosts,
        authors: todayAuthors,
      },
    };
  }
}
