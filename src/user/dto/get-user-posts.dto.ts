import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetUserPostsDto {
  @IsNumber()
  @Type(() => Number)
  userId: number;
}
