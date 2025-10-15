import { IsNumber } from 'class-validator';

export class loginCheckDto {
  @IsNumber()
  userId: number;
}
