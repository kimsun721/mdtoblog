import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { CommonService } from 'src/common/common.service';
import { Post } from 'src/post/post.entity';
import { In, Repository } from 'typeorm';
import { Repo } from 'src/repo/repo.entity';
import { PostLike } from 'src/like/entity/post-like.entity';
import { CommentLike } from 'src/like/entity/comment-like.entity';

@Injectable()
export class PostService {
  constructor(
    // TODO : 저거 현재 liked불러오기 제대로 작동안함 고치기
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Repo)
    private readonly repoRepository: Repository<Repo>,

    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,

    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,

    private readonly commonService: CommonService,
  ) {}

  async getAllPosts(page: number, limit: number) {
    if (!page) page = 1;
    if (!limit) limit = 10;
    const res = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .loadRelationCountAndMap('post.likeCount', 'post.post_likes')
      .select([
        'post.id',
        'post.title',
        'post.updatedAt',
        'post.content',
        'user.id',
        'user.userName',
        'user.githubId',
      ])
      .orderBy('post.updatedAt', 'ASC')
      .take(limit)
      .skip((page - 1) * limit)
      .getMany();

    return res;
  }
  async syncPosts(userId: number, pushed_at: Date) {
    const user = await this.commonService.findUserOrFail(userId);
    const repo = await this.repoRepository.findOneOrFail({ where: { user } });
    const oldPosts = await this.postRepository.find({ where: { user: { id: userId } } });
    const token = await this.commonService.tokenDecrypt(userId);
    const userName = user.userName;
    const repoName = repo.repoName;
    const mdFiles = repo.mdFiles;

    const posts = await Promise.all(
      mdFiles.map(async (path) => {
        const url = `https://api.github.com/repos/${userName}/${repoName}/contents/${path}`;
        const res = await axios.get(url, {
          headers: this.commonService.header(token),
        });

        const content = Buffer.from(res.data.content, 'base64').toString('utf-8');
        const sha = res.data.sha;
        const postExist = await this.postRepository.findOneBy({ sha });

        if (!postExist && content) {
          const post = await this.postRepository.save({
            user,
            repo,
            title: res.data.name,
            updated_at: pushed_at,
            content,
            sha,
          });
          return post.id;
        }
        return postExist?.id;
      }),
    );

    const deletedPostsIds = oldPosts.filter((p) => !posts.includes(p.id)).map((p) => p.id);

    if (deletedPostsIds.length != 0) {
      const res = await this.postRepository.delete(deletedPostsIds);
    }

    return {
      success: true,
    };
  }

  async getPost(postId: number, userId: number | null) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :id', { id: postId })
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.comment', 'comment')
      .leftJoinAndSelect('comment.user', 'commentUser')
      .loadRelationCountAndMap('post.likeCount', 'post.post_likes')
      .addSelect(['user.id'])
      .select([
        'post.id',
        'post.title',
        'post.updatedAt',
        'post.content',
        'post.views',
        'post.userId',
        'user.id',
        'user.userName',
        'user.githubId',
        'comment.id',
        'comment.parentId',
        'comment.createdAt',
        'commentUser.id',
        'commentUser.userName',
        'commentUser.githubId',
        'comment.content',
      ])
      .getOne();

    if (!post) {
      throw new NotFoundException();
    }
    const views = post.views + 1;
    await this.postRepository.update({ id: postId }, { views });

    let postLike;
    let commentLikeMap = {};
    let commentLikeCount = {};

    const commentIds = post.comment.map((c) => c.id);

    if (userId) {
      postLike = await this.postLikeRepository.findOne({
        where: { post: { id: postId }, user: { id: userId } },
        select: { id: true },
      });

      const commentLikes = await this.commentLikeRepository.find({
        where: { user: { id: userId }, comment: { id: In(commentIds) } },
        relations: ['comment'],
        select: { id: true, comment: { id: true } },
      });
      commentLikes.forEach((cl) => {
        commentLikeMap[cl.comment.id] = cl.id;

        if (!commentLikeCount[cl.comment.id]) commentLikeCount[cl.comment.id] = 0;
        commentLikeCount[cl.comment.id]++;
      });
    }

    post.comment = post.comment.map((c) => ({
      ...c,
      likeId: commentLikeMap[c.id] || null,
      liked: !!commentLikeMap[c.id],
      likeCount: commentLikeCount[c.id] || 0,
    }));

    return { ...post, liked: !!postLike, likeId: postLike?.id ?? null };
  }

  async searchPost(keyword: string): Promise<Post[]> {
    const res = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('MATCH(post.title, post.content) AGAINST(:keyword IN NATURAL LANGUAGE MODE)', {
        keyword,
      })
      .getMany();

    return res;
  }
}
