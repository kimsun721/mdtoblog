import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRepoDto {
  @IsString()
  repoName: string;

  @IsArray()
  @IsOptional()
  ignorePath?: string[];

  @IsNumber()
  @IsOptional()
  refreshIntervalMinutes?: number;
}
