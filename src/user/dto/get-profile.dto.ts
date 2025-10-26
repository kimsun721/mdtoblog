import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetProfileDto {
  @IsNumber()
  @Type(() => Number)
  id: number;
}
