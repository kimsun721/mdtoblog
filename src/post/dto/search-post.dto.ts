import { IsString } from 'class-validator';

export class SearchPostDto {
  @IsString()
  q: string;
}
