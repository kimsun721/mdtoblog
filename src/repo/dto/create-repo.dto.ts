import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRepoDto {
  @IsString()
  repoName: string;

  @IsString()
  @IsOptional()
  branch?: string;

  @IsArray()
  @IsOptional()
  ignorePath?: string[];

  @IsNumber()
  @IsOptional()
  refreshIntervalMinutes?: number;
}
