import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class AuthResponseDto {
  @ApiProperty({ example: 'true', description: '깃허브 로그인 성공여부' })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: 'gh-qd1k2d0k1da', description: 'access token' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: 'gh-qd1k2d0k1da', description: 'refresh token' })
  @IsString()
  refreshToken: string;
}
