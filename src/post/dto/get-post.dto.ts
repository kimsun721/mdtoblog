import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetPostDto {
  @IsNumber()
  @Type(() => Number)
  id: number;
}
