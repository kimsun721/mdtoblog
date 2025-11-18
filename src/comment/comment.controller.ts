import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { LikeService } from 'src/like/like.service';
import { UserId } from 'src/common/decorators/user-id.decorator';

@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly likeService: LikeService,
  ) {}

  @Get(':postId')
  async getComments(@Param('postId') postId: number) {
    return await this.commentService.getComments(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createComment(@UserId() userId: number, @Body() dto: CreateCommentDto) {
    return await this.commentService.createComment(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':commentId')
  async updateComment(
    @UserId() userId: number,
    @Param('commentId') commentId: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return await this.commentService.updateComment(userId, commentId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: number, @UserId() userId: number) {
    return await this.commentService.deleteComment(userId, commentId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/:commentId/likes')
  async createCommentLike(@UserId() userId: number, @Param('commentId') commentId: number) {
    await this.likeService.createCommentLike(userId, commentId);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:likeId/likes')
  async deleteCommentLike(@Param('likeId') likeId: number, @UserId() userId: number) {
    await this.likeService.deleteCommentLike(userId, likeId);
    return;
  }
}
