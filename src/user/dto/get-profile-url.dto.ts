import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetProfileUrlDto {
  @IsNumber()
  @Type(() => Number)
  id: number;
}
