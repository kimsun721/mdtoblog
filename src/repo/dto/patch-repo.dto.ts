import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class PatchRepoDto {
  @IsString()
  @IsOptional()
  branch?: string;

  @IsArray()
  @IsOptional()
  ignorePath?: string[];
}
