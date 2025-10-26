import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetPostsDto {
  @IsNumber()
  @Type(() => Number)
  id: number;
}
