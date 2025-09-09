import { IsNumber } from "class-validator";

export class DeleteRepoDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  repoId: number;
}
