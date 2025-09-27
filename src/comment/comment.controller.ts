import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GetCommentsDto } from './dto/get-comments.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':id')
  async getComments(@Param() dto: GetCommentsDto) {
    return await this.commentService.getComments(dto.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createComment(@Req() req, @Body() dto: CreateCommentDto) {
    return await this.commentService.createComment(dto, req.user.profile.id);
  }
}
