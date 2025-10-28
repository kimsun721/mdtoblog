import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  Req,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { LikeEntityType } from './type/like-entity-type';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async createLike(@Req() req, @Body() dto: CreateLikeDto) {
    await this.likeService.createLike(req.user.profile.userId, dto);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async DeleteLikeDto(@Req() req, @Param('id') id: number) {
    await this.likeService.deleteLike(req.user.profile.userId, id);
    return;
  }
}
