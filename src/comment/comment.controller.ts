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
  async createComment(@Req() req, @Body() dto: CreateCommentDto) {
    console.log(req.user.profile.id, req.user.profile.userId);
    return await this.commentService.createComment(dto, req.user.profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':commentId')
  async updateComment(
    @Req() req,
    @Param('commentId') commentId: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return await this.commentService.updateComment(req.user.profile.userId, commentId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: number, @Req() req) {
    return await this.commentService.deleteComment(req.user.profile.userId, commentId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/:commentId/likes')
  async createCommentLike(@Req() req, @Param('commentId') commentId: number) {
    await this.likeService.createCommentLike(req.user.profile.userId, commentId);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:likeId/likes')
  async deleteCommentLike(@Param('likeId') likeId: number, @Req() req) {
    await this.likeService.deleteCommentLike(req.user.profile.userId, likeId);
    return;
  }
}
