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
import { GetCommentsDto } from './dto/get-comments.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { LikeService } from 'src/like/like.service';

@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly likeService: LikeService,
  ) {}

  @Get(':id')
  async getComments(@Param() dto: GetCommentsDto) {
    return await this.commentService.getComments(dto.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createComment(@Req() req, @Body() dto: CreateCommentDto) {
    return await this.commentService.createComment(dto, req.user.profile.id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async updateComment(
    @Req() req,
    @Param('id') id: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return await this.commentService.updateComment(req.user.profile.userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteComment(@Param('id') id: number, @Req() req) {
    return await this.commentService.deleteComment(req.user.profile.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/:id/likes')
  async createCommentLike(@Req() req, @Param('id') commentId: number) {
    await this.likeService.createCommentLike(req.user.profile.userId, commentId);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/:id/likes')
  async deleteCommentLike(@Param('id') id: number, @Req() req) {
    await this.likeService.deleteCommentLike(req.user.profile.userId, id);
    return;
  }
}
