import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class RegisterDto {
    @ApiProperty({ example: 'sun', description: 'username' })
    @IsString()
    username:string;

    @ApiProperty({ example: '1234', description: 'password' })
    @IsString()
    password:string;
}