import { IsEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNumber()
  postId: number;

  @IsNumber()
  @IsOptional()
  parentId?: number;

  @IsString()
  content: string;
}
