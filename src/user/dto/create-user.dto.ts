import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ example : "test@gmail.com", description : "이메일"})
    @IsEmail()
    email : string

    @ApiProperty({ example : "test", description : "유저네임"})
    @IsString()
    username : string

    @ApiProperty({ example : "12341234", description : "비밀번호"})
    @IsString()
    password : string
}
