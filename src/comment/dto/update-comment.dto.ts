import { Expose } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  content: string;
}

export class UpdateCommentResponseDto {
  @Expose()
  @IsNumber()
  id: number;

  @Expose()
  @IsString()
  content: string;

  @Expose()
  @IsDate()
  updatedAt: Date;
}
