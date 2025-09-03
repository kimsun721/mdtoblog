import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class OauthLoginDto {
  @ApiProperty({ example: 'test@gmail.com', description: '이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'test', description: '유저네임' })
  @IsString()
  userName: string;

  @ApiProperty({
    example: 'gh-qd1k2d0k1da',
    description: '깃허브 api access token',
  })
  @IsString()
  githubAccessToken: string;
}
