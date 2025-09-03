import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNumber()
  userId: number;

  @IsString()
  userName: string;

  @IsString()
  repoName: string;

  @IsString()
  token: string;

  @IsArray()
  mdFiles: string[];
}
