import { IsString } from 'class-validator';

export class SyncRepoDto {
  @IsString()
  repoName: string;
}
