import { IsArray, IsString } from "class-validator";

export class CreateRepoDto {
    @IsString()
    repo:string

    @IsArray()
    ignore_path?:string
}