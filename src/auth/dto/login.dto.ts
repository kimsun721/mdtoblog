import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";


export class LoginDto {
    @ApiProperty({ example : "test@gmail.com", description : "이메일 (로그인시 이메일 또는 유저네임 사용 가능)"})
    @IsEmail()
    @IsOptional()
    email?:string

    @ApiProperty({ example : "test", description : "유저네임 (로그인시 이메일 또는 유저네임 사용 가능)"})
    @IsString()
    @IsOptional()
    username?:string

    @ApiProperty({ example : "12341234", description : "비밀번호"})
    @IsString()
    password:string
}
