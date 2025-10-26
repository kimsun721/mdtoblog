import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/post.entity';
import { GetPostsDto } from 'src/post/dto/get-posts.dto';
import { GetUserPostsDto } from './dto/get-user-posts.dto';
import { Comment } from 'src/comment/comment.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async getUserProfile(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        userName: true,
        email: true,
        githubId: true,
      },
    });
    if (!user) throw new NotFoundException();

    return user;
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    const posts = await this.postRepository.find({
      where: { user: { id: userId } },
      select: {
        id: true,
        title: true,
        likes: true,
        views: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return posts;
  }

  async getUserComments(userId: number): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: { user: { id: userId } },
      select: {
        id: true,
        content: true,
        updatedAt: true,
        createdAt: true,
        post: { id: true, title: true },
      },
      relations: ['post'],
    });

    return comments;
  }
}
