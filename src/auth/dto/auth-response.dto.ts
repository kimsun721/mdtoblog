import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class AuthResponseDto {
  @ApiProperty({ example: 'true', description: '깃허브 로그인 성공여부' })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: 'gh-qd1k2d0k1da', description: 'access token' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: 'f9b321dc-6d1a-43e1-bf83-88cdc76aab2b', description: 'uuid' })
  @IsString()
  uuid: string;
}
